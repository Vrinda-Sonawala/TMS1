package com.aegisbank.service.impl;

import com.aegisbank.dto.request.TransactionRequest;
import com.aegisbank.dto.request.TransferRequest;
import com.aegisbank.dto.response.TransactionResponse;
import com.aegisbank.entity.Account;
import com.aegisbank.entity.Transaction;
import com.aegisbank.entity.User;
import com.aegisbank.enums.TransactionStatus;
import com.aegisbank.enums.TransactionType;
import com.aegisbank.enums.UserRole;
import com.aegisbank.exception.AccountNotFoundException;
import com.aegisbank.exception.InvalidTransactionException;
import com.aegisbank.exception.UnauthorizedAccessException;
import com.aegisbank.mapper.EntityMapper;
import com.aegisbank.repository.AccountRepository;
import com.aegisbank.repository.TransactionRepository;
import com.aegisbank.repository.UserRepository;
import com.aegisbank.service.TransactionService;
import com.aegisbank.util.ReferenceGenerator;
import com.aegisbank.validator.AccountTypeValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Core transaction service implementing ACID-compliant banking operations.
 *
 * Concurrency Strategy:
 * - PESSIMISTIC_WRITE locks (SELECT FOR UPDATE) on account rows during balance mutations.
 *   This is preferred over optimistic-only locking for banking because:
 *   1. Balance updates are write-heavy under contention on the same account.
 *   2. Failed optimistic retries would cause poor UX for financial transactions.
 *   3. Pessimistic locks guarantee serializable balance updates at the row level.
 * - @Version on Account provides secondary optimistic locking defense.
 * - REPEATABLE_READ isolation prevents dirty reads and non-repeatable reads within a transaction.
 * - Full rollback on any exception ensures atomicity (no partial debits/credits).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;
    private final AccountTypeValidator accountTypeValidator;

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public TransactionResponse deposit(TransactionRequest request, String userEmail) {
        validatePositiveAmount(request.getAmount());
        Account account = lockAccount(request.getAccountNumber());
        authorizeAccountAccess(account, userEmail);
        accountTypeValidator.validateAccountForTransaction(account, false, request.getAmount());

        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        Transaction txn = persistTransaction(
                null,
                account.getAccountNumber(),
                TransactionType.DEPOSIT,
                request.getAmount(),
                TransactionStatus.SUCCESS,
                request.getDescription());

        log.info("Deposit successful: ref={} account={} amount={}", txn.getReferenceNumber(),
                account.getAccountNumber(), request.getAmount());
        return entityMapper.toTransactionResponse(txn);
    }

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public TransactionResponse withdraw(TransactionRequest request, String userEmail) {
        validatePositiveAmount(request.getAmount());
        Account account = lockAccount(request.getAccountNumber());
        authorizeAccountAccess(account, userEmail);
        accountTypeValidator.validateAccountForTransaction(account, true, request.getAmount());

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountTypeValidator.updateDailyWithdrawalTracking(account, request.getAmount());
        accountRepository.save(account);

        Transaction txn = persistTransaction(
                account.getAccountNumber(),
                null,
                TransactionType.WITHDRAW,
                request.getAmount(),
                TransactionStatus.SUCCESS,
                request.getDescription());

        log.info("Withdrawal successful: ref={} account={} amount={}", txn.getReferenceNumber(),
                account.getAccountNumber(), request.getAmount());
        return entityMapper.toTransactionResponse(txn);
    }

    @Override
    @Transactional(isolation = Isolation.REPEATABLE_READ, rollbackFor = Exception.class)
    public TransactionResponse transfer(TransferRequest request, String userEmail) {
        validatePositiveAmount(request.getAmount());

        if (request.getSenderAccountNumber().equals(request.getReceiverAccountNumber())) {
            throw new InvalidTransactionException("Cannot transfer to the same account");
        }

        // Lock accounts in consistent order to prevent deadlocks
        Account first = lockAccount(request.getSenderAccountNumber());
        Account second = lockAccount(request.getReceiverAccountNumber());

        Account sender = first.getAccountNumber().equals(request.getSenderAccountNumber()) ? first : second;
        Account receiver = first.getAccountNumber().equals(request.getReceiverAccountNumber()) ? first : second;

        authorizeAccountAccess(sender, userEmail);
        accountTypeValidator.validateTransfer(sender, receiver);
        accountTypeValidator.validateAccountForTransaction(sender, true, request.getAmount());

        sender.setBalance(sender.getBalance().subtract(request.getAmount()));
        receiver.setBalance(receiver.getBalance().add(request.getAmount()));
        accountTypeValidator.updateDailyWithdrawalTracking(sender, request.getAmount());

        accountRepository.save(sender);
        accountRepository.save(receiver);

        Transaction txn = persistTransaction(
                sender.getAccountNumber(),
                receiver.getAccountNumber(),
                TransactionType.TRANSFER,
                request.getAmount(),
                TransactionStatus.SUCCESS,
                request.getDescription());

        log.info("Transfer successful: ref={} from={} to={} amount={}",
                txn.getReferenceNumber(), sender.getAccountNumber(),
                receiver.getAccountNumber(), request.getAmount());
        return entityMapper.toTransactionResponse(txn);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionHistory(String accountNumber, String userEmail) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
        authorizeAccountAccess(account, userEmail);
        return entityMapper.toTransactionResponseList(
                transactionRepository.findByAccountNumber(accountNumber));
    }

    private Account lockAccount(String accountNumber) {
        return accountRepository.findByAccountNumberForUpdate(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
    }

    private Transaction persistTransaction(String sender, String receiver, TransactionType type,
                                           BigDecimal amount, TransactionStatus status, String description) {
        Transaction txn = Transaction.builder()
                .referenceNumber(ReferenceGenerator.generateTransactionReference())
                .senderAccount(sender)
                .receiverAccount(receiver)
                .transactionType(type)
                .amount(amount)
                .transactionStatus(status)
                .description(description)
                .build();
        return transactionRepository.save(txn);
    }

    private void validatePositiveAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransactionException("Transaction amount must be positive");
        }
    }

    private void authorizeAccountAccess(Account account, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AccountNotFoundException("User not found"));
        if (!account.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Not authorized for this account");
        }
    }
}

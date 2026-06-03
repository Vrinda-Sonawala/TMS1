package com.aegisbank.service.impl;

import com.aegisbank.config.BankingProperties;
import com.aegisbank.dto.request.CreateAccountRequest;
import com.aegisbank.dto.response.AccountResponse;
import com.aegisbank.dto.response.BalanceResponse;
import com.aegisbank.entity.Account;
import com.aegisbank.entity.User;
import com.aegisbank.enums.AccountStatus;
import com.aegisbank.enums.AccountType;
import com.aegisbank.enums.UserRole;
import com.aegisbank.exception.AccountNotFoundException;
import com.aegisbank.exception.UnauthorizedAccessException;
import com.aegisbank.mapper.EntityMapper;
import com.aegisbank.repository.AccountRepository;
import com.aegisbank.repository.UserRepository;
import com.aegisbank.service.AccountService;
import com.aegisbank.util.ReferenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;
    private final BankingProperties bankingProperties;

    @Override
    @Transactional
    public AccountResponse createAccount(CreateAccountRequest request, String userEmail) {
        User user = findUserByEmail(userEmail);
        Account account = buildAccount(request.getAccountType(), user);
        Account saved = accountRepository.save(account);
        log.info("Account created: {} type={} for user={}", saved.getAccountNumber(), saved.getAccountType(), userEmail);
        return entityMapper.toAccountResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccount(String accountNumber, String userEmail) {
        Account account = findAccountOrThrow(accountNumber);
        authorizeAccountAccess(account, userEmail);
        return entityMapper.toAccountResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public BalanceResponse getBalance(String accountNumber, String userEmail) {
        Account account = findAccountOrThrow(accountNumber);
        authorizeAccountAccess(account, userEmail);
        return BalanceResponse.builder()
                .accountNumber(account.getAccountNumber())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .asOf(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsByUserId(Long userId, String userEmail) {
        User requester = findUserByEmail(userEmail);
        if (!requester.getId().equals(userId) && requester.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Not authorized to view these accounts");
        }
        return entityMapper.toAccountResponseList(accountRepository.findByUserId(userId));
    }

    private Account buildAccount(AccountType type, User user) {
        Account.AccountBuilder builder = Account.builder()
                .accountNumber(ReferenceGenerator.generateAccountNumber())
                .accountType(type)
                .balance(BigDecimal.ZERO)
                .status(AccountStatus.ACTIVE)
                .currency(bankingProperties.getDefaultCurrency())
                .user(user);

        return switch (type) {
            case SAVINGS -> builder
                    .minimumBalance(bankingProperties.getSavings().getMinimumBalance())
                    .build();
            case CURRENT -> builder
                    .minimumBalance(BigDecimal.ZERO)
                    .overdraftLimit(bankingProperties.getCurrent().getOverdraftLimit())
                    .build();
            case BUSINESS -> builder
                    .minimumBalance(BigDecimal.ZERO)
                    .build();
            case SALARY -> builder
                    .minimumBalance(BigDecimal.ZERO)
                    .build();
            case FIXED_DEPOSIT -> builder
                    .minimumBalance(BigDecimal.ZERO)
                    .maturityDate(LocalDate.now().plusDays(bankingProperties.getFixedDeposit().getLockPeriodDays()))
                    .build();
        };
    }

    private Account findAccountOrThrow(String accountNumber) {
        String cleanAccountNumber = accountNumber.trim().toUpperCase();
        return accountRepository.findByAccountNumber(cleanAccountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + cleanAccountNumber));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException("User not found"));
    }

    private void authorizeAccountAccess(Account account, String userEmail) {
        User user = findUserByEmail(userEmail);
        if (!account.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedAccessException("Not authorized to access this account");
        }
    }
}

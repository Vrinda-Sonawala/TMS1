package com.aegisbank.validator;

import com.aegisbank.config.BankingProperties;
import com.aegisbank.entity.Account;
import com.aegisbank.enums.AccountStatus;
import com.aegisbank.enums.AccountType;
import com.aegisbank.exception.AccountFrozenException;
import com.aegisbank.exception.InsufficientBalanceException;
import com.aegisbank.exception.InvalidTransactionException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Validates account-type-specific business rules before transaction execution.
 */
@Component
@RequiredArgsConstructor
public class AccountTypeValidator {

    private final BankingProperties bankingProperties;

    public void validateAccountForTransaction(Account account, boolean isDebit, BigDecimal amount) {
        validateAccountStatus(account);

        if (isDebit) {
            switch (account.getAccountType()) {
                case FIXED_DEPOSIT -> {
                    if (account.getMaturityDate() != null && LocalDate.now().isBefore(account.getMaturityDate())) {
                        throw new InvalidTransactionException(
                                "Fixed deposit account is locked until maturity: " + account.getMaturityDate());
                    }
                    if (account.getBalance().compareTo(amount) < 0) {
                        throw new InsufficientBalanceException("Insufficient balance in fixed deposit account");
                    }
                }
                case SAVINGS -> validateSavingsWithdrawal(account, amount);
                case CURRENT -> validateCurrentWithdrawal(account, amount);
                case BUSINESS -> validateBusinessTransaction(account, amount);
                case SALARY -> validateSalaryWithdrawal(account, amount);
            }
        }
    }

    public void validateTransfer(Account sender, Account receiver) {
        validateAccountStatus(sender);
        validateAccountStatus(receiver);

        if (sender.getAccountNumber().equals(receiver.getAccountNumber())) {
            throw new InvalidTransactionException("Cannot transfer to the same account");
        }

        if (sender.getStatus() == AccountStatus.FROZEN) {
            throw new AccountFrozenException("Sender account is frozen and cannot transfer funds");
        }

        if (receiver.getStatus() == AccountStatus.FROZEN || receiver.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidTransactionException("Receiver account is not eligible to receive funds");
        }
    }

    private void validateAccountStatus(Account account) {
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new InvalidTransactionException("Account is closed and cannot perform transactions");
        }
        if (account.getStatus() == AccountStatus.BLOCKED) {
            throw new AccountFrozenException("Account is blocked");
        }
        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new AccountFrozenException("Account is frozen");
        }
    }

    private void validateSavingsWithdrawal(Account account, BigDecimal amount) {
        BigDecimal projectedBalance = account.getBalance().subtract(amount);
        if (projectedBalance.compareTo(account.getMinimumBalance()) < 0) {
            throw new InsufficientBalanceException(
                    "Withdrawal would breach minimum balance requirement of " + account.getMinimumBalance());
        }

        resetDailyWithdrawalIfNewDay(account);
        BigDecimal newDailyTotal = account.getDailyWithdrawn().add(amount);
        if (newDailyTotal.compareTo(bankingProperties.getSavings().getDailyWithdrawalLimit()) > 0) {
            throw new InvalidTransactionException(
                    "Daily withdrawal limit of " + bankingProperties.getSavings().getDailyWithdrawalLimit() + " exceeded");
        }
    }

    private void validateCurrentWithdrawal(Account account, BigDecimal amount) {
        BigDecimal available = account.getBalance().add(account.getOverdraftLimit());
        if (amount.compareTo(available) > 0) {
            throw new InsufficientBalanceException(
                    "Insufficient funds including overdraft limit of " + account.getOverdraftLimit());
        }
    }

    private void validateBusinessTransaction(Account account, BigDecimal amount) {
        resetDailyWithdrawalIfNewDay(account);
        BigDecimal newDailyTotal = account.getDailyWithdrawn().add(amount);
        if (newDailyTotal.compareTo(bankingProperties.getBusiness().getDailyTransactionLimit()) > 0) {
            throw new InvalidTransactionException("Business daily transaction limit exceeded");
        }
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for business transaction");
        }
    }

    private void validateSalaryWithdrawal(Account account, BigDecimal amount) {
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }
    }

    public void updateDailyWithdrawalTracking(Account account, BigDecimal amount) {
        if (account.getAccountType() == AccountType.SAVINGS
                || account.getAccountType() == AccountType.BUSINESS) {
            resetDailyWithdrawalIfNewDay(account);
            account.setDailyWithdrawn(account.getDailyWithdrawn().add(amount));
            account.setLastWithdrawalDate(LocalDate.now());
        }
    }

    private void resetDailyWithdrawalIfNewDay(Account account) {
        LocalDate today = LocalDate.now();
        if (account.getLastWithdrawalDate() == null || !account.getLastWithdrawalDate().equals(today)) {
            account.setDailyWithdrawn(BigDecimal.ZERO);
            account.setLastWithdrawalDate(today);
        }
    }
}

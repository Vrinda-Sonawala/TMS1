package com.aegisbank.service.impl;

import com.aegisbank.config.BankingProperties;
import com.aegisbank.dto.request.TransactionRequest;
import com.aegisbank.dto.request.TransferRequest;
import com.aegisbank.entity.Account;
import com.aegisbank.entity.User;
import com.aegisbank.enums.*;
import com.aegisbank.exception.InsufficientBalanceException;
import com.aegisbank.exception.InvalidTransactionException;
import com.aegisbank.mapper.EntityMapper;
import com.aegisbank.repository.AccountRepository;
import com.aegisbank.repository.TransactionRepository;
import com.aegisbank.repository.UserRepository;
import com.aegisbank.validator.AccountTypeValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private EntityMapper entityMapper;
    @Mock private AccountTypeValidator accountTypeValidator;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User customer;
    private Account savingsAccount;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).email("customer@test.com").role(UserRole.CUSTOMER).build();
        savingsAccount = Account.builder()
                .id(1L).accountNumber("AC1234567890").accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00")).minimumBalance(new BigDecimal("500.00"))
                .status(AccountStatus.ACTIVE).user(customer).version(0L).build();
    }

    @Test
    void deposit_shouldIncreaseBalance() {
        TransactionRequest request = TransactionRequest.builder()
                .accountNumber("AC1234567890").amount(new BigDecimal("200.00")).build();

        when(accountRepository.findByAccountNumberForUpdate("AC1234567890")).thenReturn(Optional.of(savingsAccount));
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(entityMapper.toTransactionResponse(any())).thenReturn(null);

        transactionService.deposit(request, "customer@test.com");

        assertEquals(new BigDecimal("1200.00"), savingsAccount.getBalance());
        verify(accountRepository).save(savingsAccount);
    }

    @Test
    void withdraw_shouldFailWhenInsufficientBalance() {
        TransactionRequest request = TransactionRequest.builder()
                .accountNumber("AC1234567890").amount(new BigDecimal("600.00")).build();

        when(accountRepository.findByAccountNumberForUpdate("AC1234567890")).thenReturn(Optional.of(savingsAccount));
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        doThrow(new InsufficientBalanceException("Insufficient balance"))
                .when(accountTypeValidator).validateAccountForTransaction(savingsAccount, true, request.getAmount());

        assertThrows(InsufficientBalanceException.class,
                () -> transactionService.withdraw(request, "customer@test.com"));
        verify(accountRepository, never()).save(any());
    }

    @Test
    void transfer_shouldFailForSameAccount() {
        TransferRequest request = TransferRequest.builder()
                .senderAccountNumber("AC1234567890")
                .receiverAccountNumber("AC1234567890")
                .amount(new BigDecimal("100.00")).build();

        assertThrows(InvalidTransactionException.class,
                () -> transactionService.transfer(request, "customer@test.com"));
    }

    @Test
    void transfer_shouldUpdateBothAccounts() {
        Account receiver = Account.builder()
                .id(2L).accountNumber("AC9876543210").accountType(AccountType.CURRENT)
                .balance(new BigDecimal("500.00")).status(AccountStatus.ACTIVE)
                .user(customer).version(0L).build();

        TransferRequest request = TransferRequest.builder()
                .senderAccountNumber("AC1234567890")
                .receiverAccountNumber("AC9876543210")
                .amount(new BigDecimal("200.00")).build();

        when(accountRepository.findByAccountNumberForUpdate("AC1234567890")).thenReturn(Optional.of(savingsAccount));
        when(accountRepository.findByAccountNumberForUpdate("AC9876543210")).thenReturn(Optional.of(receiver));
        when(userRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(entityMapper.toTransactionResponse(any())).thenReturn(null);

        transactionService.transfer(request, "customer@test.com");

        assertEquals(new BigDecimal("800.00"), savingsAccount.getBalance());
        assertEquals(new BigDecimal("700.00"), receiver.getBalance());
        verify(accountRepository, times(2)).save(any());
    }
}

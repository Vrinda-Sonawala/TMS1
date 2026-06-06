package com.aegisbank.service;

import com.aegisbank.dto.request.CreateAccountRequest;
import com.aegisbank.dto.response.AccountResponse;
import com.aegisbank.dto.response.BalanceResponse;

import java.util.List;

public interface AccountService {
    AccountResponse createAccount(CreateAccountRequest request, String userEmail);
    AccountResponse getAccount(String accountNumber, String userEmail);
    BalanceResponse getBalance(String accountNumber, String userEmail);
    List<AccountResponse> getAccountsByUserId(Long userId, String userEmail);
    void deleteAccount(Long id, String userEmail);
}

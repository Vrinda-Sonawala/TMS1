package com.aegisbank.service;

import com.aegisbank.dto.request.TransactionRequest;
import com.aegisbank.dto.request.TransferRequest;
import com.aegisbank.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionService {
    TransactionResponse deposit(TransactionRequest request, String userEmail);
    TransactionResponse withdraw(TransactionRequest request, String userEmail);
    TransactionResponse transfer(TransferRequest request, String userEmail);
    List<TransactionResponse> getTransactionHistory(String accountNumber, String userEmail);
}

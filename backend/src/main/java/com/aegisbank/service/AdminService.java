package com.aegisbank.service;

import com.aegisbank.dto.response.TransactionResponse;
import com.aegisbank.dto.response.UserResponse;

import java.util.List;

public interface AdminService {
    List<UserResponse> getAllUsers();
    List<TransactionResponse> getAllTransactions();
}

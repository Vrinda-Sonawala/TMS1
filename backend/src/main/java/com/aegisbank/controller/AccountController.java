package com.aegisbank.controller;

import com.aegisbank.dto.ApiResponse;
import com.aegisbank.dto.request.CreateAccountRequest;
import com.aegisbank.dto.response.AccountResponse;
import com.aegisbank.dto.response.BalanceResponse;
import com.aegisbank.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Account management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/create")
    @Operation(summary = "Create a new bank account")
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AccountResponse response = accountService.createAccount(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully", response));
    }

    @GetMapping("/{accountNumber}")
    @Operation(summary = "Get account details by account number")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(
            @PathVariable String accountNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                accountService.getAccount(accountNumber, userDetails.getUsername())));
    }

    @GetMapping("/balance/{accountNumber}")
    @Operation(summary = "Get current account balance")
    public ResponseEntity<ApiResponse<BalanceResponse>> getBalance(
            @PathVariable String accountNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                accountService.getBalance(accountNumber, userDetails.getUsername())));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all accounts for a user")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getUserAccounts(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                accountService.getAccountsByUserId(userId, userDetails.getUsername())));
    }
}

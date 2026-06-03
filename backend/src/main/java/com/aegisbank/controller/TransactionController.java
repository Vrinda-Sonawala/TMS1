package com.aegisbank.controller;

import com.aegisbank.dto.ApiResponse;
import com.aegisbank.dto.request.TransactionRequest;
import com.aegisbank.dto.request.TransferRequest;
import com.aegisbank.dto.response.TransactionResponse;
import com.aegisbank.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Deposit, withdraw, transfer and history APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds into an account")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TransactionResponse response = transactionService.deposit(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Deposit successful", response));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds from an account")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TransactionResponse response = transactionService.withdraw(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful", response));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds between accounts (atomic operation)")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TransactionResponse response = transactionService.transfer(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Transfer successful", response));
    }

    @PostMapping("/self-transfer")
    @Operation(summary = "Transfer funds between own accounts (atomic operation)")
    public ResponseEntity<ApiResponse<TransactionResponse>> selfTransfer(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TransactionResponse response = transactionService.selfTransfer(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Self-transfer successful", response));
    }

    @GetMapping("/history/{accountNumber}")
    @Operation(summary = "Get transaction history for an account")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getHistory(
            @PathVariable String accountNumber,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getTransactionHistory(accountNumber, userDetails.getUsername())));
    }
}

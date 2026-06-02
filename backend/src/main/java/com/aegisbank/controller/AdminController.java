package com.aegisbank.controller;

import com.aegisbank.dto.ApiResponse;
import com.aegisbank.dto.response.TransactionResponse;
import com.aegisbank.dto.response.UserResponse;
import com.aegisbank.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administrative monitoring APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "List all registered users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers()));
    }

    @GetMapping("/transactions")
    @Operation(summary = "List all system transactions (Admin only)")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getAllTransactions() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllTransactions()));
    }
}

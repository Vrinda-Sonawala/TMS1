package com.aegisbank.controller;

import com.aegisbank.dto.ApiResponse;
import com.aegisbank.dto.request.ChangePasswordRequest;
import com.aegisbank.dto.request.UserProfileRequest;
import com.aegisbank.dto.response.UserProfileResponse;
import com.aegisbank.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and settings management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get authenticated user profile details")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse response = userService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile details (full name and phone number)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserProfile(
            @Valid @RequestBody UserProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse response = userService.updateUserProfile(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Change user account password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.changePassword(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}

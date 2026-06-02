package com.aegisbank.controller;

import com.aegisbank.dto.ApiResponse;
import com.aegisbank.dto.request.BeneficiaryRequest;
import com.aegisbank.dto.response.BeneficiaryResponse;
import com.aegisbank.service.BeneficiaryService;
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
@RequestMapping("/api/v1/beneficiaries")
@RequiredArgsConstructor
@Tag(name = "Beneficiaries", description = "Beneficiary management APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    @PostMapping
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> addBeneficiary(
            @Valid @RequestBody BeneficiaryRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BeneficiaryResponse response = beneficiaryService.addBeneficiary(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Beneficiary added", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getBeneficiaries(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(beneficiaryService.getBeneficiaries(userDetails.getUsername())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        beneficiaryService.deleteBeneficiary(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Beneficiary removed", null));
    }
}

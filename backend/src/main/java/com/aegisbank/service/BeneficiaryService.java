package com.aegisbank.service;

import com.aegisbank.dto.request.BeneficiaryRequest;
import com.aegisbank.dto.response.BeneficiaryResponse;

import java.util.List;

public interface BeneficiaryService {
    BeneficiaryResponse addBeneficiary(BeneficiaryRequest request, String userEmail);
    List<BeneficiaryResponse> getBeneficiaries(String userEmail);
    void deleteBeneficiary(Long id, String userEmail);
}

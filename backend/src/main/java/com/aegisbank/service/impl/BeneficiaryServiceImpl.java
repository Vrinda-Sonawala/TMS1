package com.aegisbank.service.impl;

import com.aegisbank.dto.request.BeneficiaryRequest;
import com.aegisbank.dto.response.BeneficiaryResponse;
import com.aegisbank.entity.Beneficiary;
import com.aegisbank.entity.User;
import com.aegisbank.exception.ResourceNotFoundException;
import com.aegisbank.mapper.EntityMapper;
import com.aegisbank.repository.BeneficiaryRepository;
import com.aegisbank.repository.UserRepository;
import com.aegisbank.service.BeneficiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.aegisbank.repository.AccountRepository;
import com.aegisbank.exception.DuplicateResourceException;
import com.aegisbank.exception.AccountNotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final EntityMapper entityMapper;

    @Override
    @Transactional
    public BeneficiaryResponse addBeneficiary(BeneficiaryRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String beneficiaryAccountNumber = request.getBeneficiaryAccountNumber().trim().toUpperCase();

        if (!accountRepository.existsByAccountNumber(beneficiaryAccountNumber)) {
            throw new AccountNotFoundException("Beneficiary account number does not exist in the bank system");
        }

        if (beneficiaryRepository.existsByUserIdAndBeneficiaryAccountNumber(user.getId(), beneficiaryAccountNumber)) {
            throw new DuplicateResourceException("This beneficiary account number is already registered");
        }

        Beneficiary beneficiary = Beneficiary.builder()
                .nickname(request.getNickname())
                .beneficiaryAccountNumber(beneficiaryAccountNumber)
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .user(user)
                .build();

        return entityMapper.toBeneficiaryResponse(beneficiaryRepository.save(beneficiary));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getBeneficiaries(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return entityMapper.toBeneficiaryResponseList(beneficiaryRepository.findByUserId(user.getId()));
    }

    @Override
    @Transactional
    public void deleteBeneficiary(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Beneficiary beneficiary = beneficiaryRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
        beneficiaryRepository.delete(beneficiary);
    }
}

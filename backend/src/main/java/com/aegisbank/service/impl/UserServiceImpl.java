package com.aegisbank.service.impl;

import com.aegisbank.dto.request.ChangePasswordRequest;
import com.aegisbank.dto.request.UserProfileRequest;
import com.aegisbank.dto.response.UserProfileResponse;
import com.aegisbank.entity.Account;
import com.aegisbank.entity.User;
import com.aegisbank.enums.AccountStatus;
import com.aegisbank.exception.AccountNotFoundException;
import com.aegisbank.exception.InvalidTransactionException;
import com.aegisbank.repository.UserRepository;
import com.aegisbank.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException("User not found for email: " + email));

        return buildProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserProfile(UserProfileRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException("User not found for email: " + email));

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        User saved = userRepository.save(user);

        log.info("User profile updated for: {}", email);
        return buildProfileResponse(saved);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccountNotFoundException("User not found for email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidTransactionException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", email);
    }

    private UserProfileResponse buildProfileResponse(User user) {
        BigDecimal totalBalance = user.getAccounts().stream()
                .filter(a -> a.getStatus() != AccountStatus.CLOSED)
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalAccounts = (int) user.getAccounts().stream()
                .filter(a -> a.getStatus() != AccountStatus.CLOSED)
                .count();

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .totalAccounts(totalAccounts)
                .totalBalance(totalBalance)
                .build();
    }
}

package com.aegisbank.dto.response;

import com.aegisbank.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private LocalDateTime createdAt;
    private int totalAccounts;
    private BigDecimal totalBalance;
}

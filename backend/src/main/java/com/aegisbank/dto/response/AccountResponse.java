package com.aegisbank.dto.response;

import com.aegisbank.enums.AccountStatus;
import com.aegisbank.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private BigDecimal minimumBalance;
    private BigDecimal overdraftLimit;
    private AccountStatus status;
    private String currency;
    private Long userId;
    private LocalDate maturityDate;
    private LocalDateTime createdAt;
}

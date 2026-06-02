package com.aegisbank.dto.response;

import com.aegisbank.enums.TransactionStatus;
import com.aegisbank.enums.TransactionType;
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
public class TransactionResponse {
    private Long id;
    private String referenceNumber;
    private String senderAccount;
    private String receiverAccount;
    private TransactionType transactionType;
    private BigDecimal amount;
    private TransactionStatus transactionStatus;
    private String description;
    private LocalDateTime createdAt;
}

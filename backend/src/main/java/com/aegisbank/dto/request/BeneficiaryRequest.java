package com.aegisbank.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryRequest {

    @NotBlank(message = "Nickname is required")
    @Size(max = 100)
    private String nickname;

    @NotBlank(message = "Beneficiary account number is required")
    @Pattern(regexp = "^AC\\d{18}$", message = "Account number must start with AC followed by exactly 18 digits")
    private String beneficiaryAccountNumber;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "IFSC code is required")
    private String ifscCode;
}

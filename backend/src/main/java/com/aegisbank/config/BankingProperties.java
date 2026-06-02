package com.aegisbank.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
@ConfigurationProperties(prefix = "aegis.banking")
@Getter
@Setter
public class BankingProperties {

    private String defaultCurrency = "USD";
    private SavingsConfig savings = new SavingsConfig();
    private CurrentConfig current = new CurrentConfig();
    private BusinessConfig business = new BusinessConfig();
    private FixedDepositConfig fixedDeposit = new FixedDepositConfig();

    @Getter
    @Setter
    public static class SavingsConfig {
        private BigDecimal minimumBalance = new BigDecimal("500.00");
        private BigDecimal dailyWithdrawalLimit = new BigDecimal("5000.00");
        private BigDecimal interestRate = new BigDecimal("0.035");
    }

    @Getter
    @Setter
    public static class CurrentConfig {
        private BigDecimal overdraftLimit = new BigDecimal("10000.00");
    }

    @Getter
    @Setter
    public static class BusinessConfig {
        private BigDecimal dailyTransactionLimit = new BigDecimal("100000.00");
    }

    @Getter
    @Setter
    public static class FixedDepositConfig {
        private int lockPeriodDays = 365;
        private BigDecimal interestRate = new BigDecimal("0.065");
    }
}

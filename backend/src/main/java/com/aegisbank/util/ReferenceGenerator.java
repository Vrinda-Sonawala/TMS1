package com.aegisbank.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class ReferenceGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private ReferenceGenerator() {}

    public static String generateAccountNumber() {
        return AppConstants.ACCOUNT_NUMBER_PREFIX
                + LocalDateTime.now().format(FORMATTER)
                + String.format("%04d", RANDOM.nextInt(10000));
    }

    public static String generateTransactionReference() {
        return AppConstants.TXN_REFERENCE_PREFIX
                + LocalDateTime.now().format(FORMATTER)
                + String.format("%06d", RANDOM.nextInt(1000000));
    }
}

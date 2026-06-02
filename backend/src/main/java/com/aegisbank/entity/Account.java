package com.aegisbank.entity;

import com.aegisbank.audit.AuditableEntity;
import com.aegisbank.enums.AccountStatus;
import com.aegisbank.enums.AccountType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "accounts", indexes = {
        @Index(name = "idx_accounts_user", columnList = "user_id"),
        @Index(name = "idx_accounts_type", columnList = "account_type"),
        @Index(name = "idx_accounts_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "account_number", nullable = false, unique = true, length = 20)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "minimum_balance", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal minimumBalance = BigDecimal.ZERO;

    @Column(name = "overdraft_limit", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal overdraftLimit = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "daily_withdrawn", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal dailyWithdrawn = BigDecimal.ZERO;

    @Column(name = "last_withdrawal_date")
    private LocalDate lastWithdrawalDate;

    @Column(name = "maturity_date")
    private LocalDate maturityDate;

    /**
     * Optimistic locking version field.
     * Used as secondary defense; primary concurrency control uses pessimistic DB locks
     * during balance mutations to prevent lost updates under high contention.
     */
    @Version
    @Column(nullable = false)
    @Builder.Default
    private Long version = 0L;
}

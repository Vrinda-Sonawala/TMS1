package com.aegisbank.repository;

import com.aegisbank.entity.Transaction;
import com.aegisbank.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
            SELECT t FROM Transaction t
            WHERE t.senderAccount = :accountNumber OR t.receiverAccount = :accountNumber
            ORDER BY t.createdAt DESC
            """)
    List<Transaction> findByAccountNumber(@Param("accountNumber") String accountNumber);

    Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Transaction> findByTransactionStatus(TransactionStatus status);

    @Query("""
            SELECT t FROM Transaction t
            WHERE (t.senderAccount = :accountNumber OR t.receiverAccount = :accountNumber)
            AND t.createdAt BETWEEN :start AND :end
            ORDER BY t.createdAt DESC
            """)
    List<Transaction> findByAccountAndDateRange(
            @Param("accountNumber") String accountNumber,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}

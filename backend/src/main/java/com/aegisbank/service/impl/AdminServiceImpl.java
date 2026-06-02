package com.aegisbank.service.impl;

import com.aegisbank.dto.response.TransactionResponse;
import com.aegisbank.dto.response.UserResponse;
import com.aegisbank.mapper.EntityMapper;
import com.aegisbank.repository.TransactionRepository;
import com.aegisbank.repository.UserRepository;
import com.aegisbank.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final EntityMapper entityMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        log.info("Admin fetching all users");
        return entityMapper.toUserResponseList(userRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {
        log.info("Admin fetching all transactions");
        return entityMapper.toTransactionResponseList(
                transactionRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 500)).getContent());
    }
}

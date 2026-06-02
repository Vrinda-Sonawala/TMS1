package com.aegisbank.mapper;

import com.aegisbank.dto.response.AccountResponse;
import com.aegisbank.dto.response.BeneficiaryResponse;
import com.aegisbank.dto.response.TransactionResponse;
import com.aegisbank.dto.response.UserResponse;
import com.aegisbank.entity.Account;
import com.aegisbank.entity.Beneficiary;
import com.aegisbank.entity.Transaction;
import com.aegisbank.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EntityMapper {

    UserResponse toUserResponse(User user);

    List<UserResponse> toUserResponseList(List<User> users);

    @Mapping(source = "user.id", target = "userId")
    AccountResponse toAccountResponse(Account account);

    List<AccountResponse> toAccountResponseList(List<Account> accounts);

    TransactionResponse toTransactionResponse(Transaction transaction);

    List<TransactionResponse> toTransactionResponseList(List<Transaction> transactions);

    BeneficiaryResponse toBeneficiaryResponse(Beneficiary beneficiary);

    List<BeneficiaryResponse> toBeneficiaryResponseList(List<Beneficiary> beneficiaries);
}

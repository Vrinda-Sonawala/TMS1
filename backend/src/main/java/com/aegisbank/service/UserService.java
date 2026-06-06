package com.aegisbank.service;

import com.aegisbank.dto.request.ChangePasswordRequest;
import com.aegisbank.dto.request.UserProfileRequest;
import com.aegisbank.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getUserProfile(String email);
    UserProfileResponse updateUserProfile(UserProfileRequest request, String email);
    void changePassword(ChangePasswordRequest request, String email);
}

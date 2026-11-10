package com.ecoroute.service;

public interface EmailService {
    boolean isValidEmailFormat(String email);
    void sendVerificationEmailPlaceholder(String toEmail, String token);
}

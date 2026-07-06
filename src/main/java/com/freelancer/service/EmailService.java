package com.freelancer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetEmail(String email, String token) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("Password Reset Request");

        message.setText(
                "Hello,\n\n" +
                "Click the link below to reset your password:\n\n" +
                "http://localhost:8080/api/v1/auth/reset-password?token=" + token +
                "\n\nThis link expires in 15 minutes."
        );

        mailSender.send(message);
    }
}
package com.freelancer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${frontend.url}")
    private String frontendUrl;

    public void sendResetEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password Reset Request");
        message.setText(
                "Hello,\n\n" +
                "Click the link below to reset your password:\n\n" +
                frontendUrl + "/reset-password?token=" + token +
                "\n\nThis link expires in 15 minutes.\n\n" +
                "If you did not request this, please ignore this email."
        );
        mailSender.send(message);
    }
}

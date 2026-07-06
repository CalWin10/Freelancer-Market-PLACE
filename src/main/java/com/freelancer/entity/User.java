package com.freelancer.entity;

import com.freelancer.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Authentication
    private String fullName;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean enabled;
    private boolean accountNonLocked;

    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    // ==========================
    // Freelancer Profile
    // ==========================

    @Column(length = 2000)
    private String skills;        // JSON String

    @Column(length = 5000)
    private String portfolio;     // JSON String

    private Double hourlyRate;

    @Column(length = 2000)
    private String bio;

    private String location;

    // ==========================
    // Client Profile
    // ==========================

    private String companyName;

    private String contactName;

    @Column(length = 2000)
    private String companyBio;

    // ==========================
    // Profile Photo
    // ==========================

    private String profilePhotoUrl;
}
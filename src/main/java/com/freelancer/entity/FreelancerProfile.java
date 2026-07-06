package com.freelancer.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FreelancerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 2000)
    private String bio;

    private String location;

    private Double hourlyRate;

    @Column(length = 3000)
    private String skills;

    private String profilePhotoUrl;
}
package com.freelancer.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
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

    // Stored as JSON array string: ["Java","React"]
    @Column(length = 3000)
    private String skills;

    private String profilePhotoUrl;

    @Builder.Default
    @OneToMany(mappedBy = "freelancerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PortfolioItem> portfolioItems = new ArrayList<>();
}

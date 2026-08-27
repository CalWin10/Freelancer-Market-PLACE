package com.freelancer.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private String projectUrl;

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "freelancer_profile_id")
    private FreelancerProfile freelancerProfile;
}
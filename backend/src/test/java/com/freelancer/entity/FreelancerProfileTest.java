package com.freelancer.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FreelancerProfileTest {

    @Test
    void builderInitializesPortfolioItems() {
        FreelancerProfile profile = FreelancerProfile.builder().build();

        assertThat(profile.getPortfolioItems()).isNotNull().isEmpty();
    }
}

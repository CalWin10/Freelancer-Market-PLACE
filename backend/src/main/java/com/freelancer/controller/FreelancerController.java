package com.freelancer.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/freelancer")
public class FreelancerController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Freelancer";
    }
}
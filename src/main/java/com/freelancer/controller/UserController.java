package com.freelancer.controller;

import com.freelancer.enums.Role;
import com.freelancer.repository.UserRepository;
import com.freelancer.service.ClientProfileService;
import com.freelancer.service.FreelancerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png");

    private final UserRepository userRepository;
    private final FreelancerProfileService freelancerProfileService;
    private final ClientProfileService clientProfileService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/me/photo")
    public ResponseEntity<String> uploadPhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File must not be empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            return ResponseEntity.badRequest().body("Only JPEG and PNG files are allowed");
        }
        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest().body("File size must not exceed 5 MB");
        }

        String ext = file.getContentType().equals("image/png") ? ".png" : ".jpg";
        String filename = UUID.randomUUID() + ext;

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename));

        String photoUrl = "/uploads/" + filename;
        savePhotoUrl(authentication, photoUrl);

        return ResponseEntity.ok(photoUrl);
    }

    @DeleteMapping("/me/photo")
    public ResponseEntity<String> deletePhoto(Authentication authentication) {
        savePhotoUrl(authentication, null);
        return ResponseEntity.ok("Profile photo removed");
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void savePhotoUrl(Authentication authentication, String url) {
        String email = authentication.getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.FREELANCER) {
            freelancerProfileService.updatePhotoUrl(email, url);
        } else if (user.getRole() == Role.CLIENT) {
            clientProfileService.updatePhotoUrl(email, url);
        }
    }
}

package com.e_commerce.glasses_store.modules.admin.controller;

import com.e_commerce.glasses_store.common.ApiResponse;
import com.e_commerce.glasses_store.modules.admin.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = cloudinaryService.uploadFile(file);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("File uploaded successfully to Cloudinary", imageUrl));

        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Could not upload file to Cloudinary. Please try again!", null));
        }
    }
}



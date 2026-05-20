package com.e_commerce.glasses_store.modules.admin.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private File convertMultipartToFile(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            originalName = "temp_" + System.currentTimeMillis();
        }
        File convFile = new File(System.getProperty("java.io.tmpdir") + File.separator + originalName);
        file.transferTo(convFile);
        return convFile;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        log.info("Uploading file to Cloudinary: {}", file.getOriginalFilename());
        File tempFile = convertMultipartToFile(file);
        try {
            Map uploadResult = cloudinary.uploader().upload(tempFile, ObjectUtils.asMap(
                    "folder", "glasses-store/products",
                    "use_filename", true,
                    "unique_filename", true,
                    "resource_type", "auto"
            ));
            String url = uploadResult.get("secure_url").toString();
            log.info("Upload successful. URL: {}", url);
            return url;
        } finally {
            if (tempFile.exists()) {
                boolean deleted = tempFile.delete();
                log.info("Temporary file deleted: {}", deleted);
            }
        }
    }

    public String uploadBytes(byte[] bytes, String fileName) throws IOException {
        log.info("Uploading bytes to Cloudinary: {}", fileName);
        if (fileName == null || fileName.trim().isEmpty()) {
            fileName = "temp_bytes_" + System.currentTimeMillis();
        }
        File tempFile = new File(System.getProperty("java.io.tmpdir") + File.separator + fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(bytes);
        }
        try {
            Map uploadResult = cloudinary.uploader().upload(tempFile, ObjectUtils.asMap(
                    "folder", "glasses-store/products",
                    "use_filename", true,
                    "unique_filename", true,
                    "resource_type", "auto"
            ));
            String url = uploadResult.get("secure_url").toString();
            log.info("Upload successful. URL: {}", url);
            return url;
        } finally {
            if (tempFile.exists()) {
                boolean deleted = tempFile.delete();
                log.info("Temporary bytes file deleted: {}", deleted);
            }
        }
    }
}

package com.e_commerce.glasses_store.modules.admin.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        log.info("Uploading file to Cloudinary: {}", file.getOriginalFilename());
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "glasses-store/products",
                "use_filename", true,
                "unique_filename", true
        ));
        String url = uploadResult.get("secure_url").toString();
        log.info("Upload successful. URL: {}", url);
        return url;
    }
}

package com.e_commerce.glasses_store.modules.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Request to import products from Excel file.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImportRequest {

    @NotNull(message = "Excel file is required")
    private MultipartFile file;
}

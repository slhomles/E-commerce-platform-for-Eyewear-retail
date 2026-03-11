package com.e_commerce.glasses_store.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank(message = "Category name is required") String name,

        @NotBlank(message = "Category slug is required") String slug,

        String description,
        String parentId,
        String imageUrl) {
}

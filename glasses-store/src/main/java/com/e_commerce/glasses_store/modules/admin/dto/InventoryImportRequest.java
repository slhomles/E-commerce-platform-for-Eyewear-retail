package com.e_commerce.glasses_store.modules.admin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Request cho nhập hàng tồn kho batch.
 * POST /api/v1/admin/inventory/import
 */
public record InventoryImportRequest(
        @NotEmpty(message = "Items list must not be empty") @Valid List<ImportItem> items) {
    public record ImportItem(
            @NotBlank(message = "Variant ID is required") String variantId,

            @Min(value = 1, message = "Quantity must be at least 1") int quantity,

            String warehouseLocation) {
    }
}

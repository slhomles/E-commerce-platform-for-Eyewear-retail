package com.e_commerce.glasses_store.modules.admin.service;

import com.e_commerce.glasses_store.modules.admin.dto.*;
import com.e_commerce.glasses_store.modules.product.dto.response.CategoryResponse;
import com.e_commerce.glasses_store.modules.product.dto.response.ProductListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    CategoryResponse createCategory(CreateCategoryRequest request);

    void importInventory(InventoryImportRequest request);

    DashboardStatsResponse getRevenueStats();

    ProductListResponse createProduct(CreateProductRequest request);

    ProductListResponse updateProduct(String id, CreateProductRequest request);

    void deleteProduct(String id);

    Page<ProductListResponse> getAllProducts(Pageable pageable);
}

package com.e_commerce.glasses_store.modules.product.repository;

import com.e_commerce.glasses_store.modules.product.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, String> {

    List<Brand> findByIsDeletedFalseOrderByNameAsc();
}

package com.e_commerce.glasses_store.modules.product.repository;

import com.e_commerce.glasses_store.modules.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, String> {

    List<Category> findByIsActiveTrueAndIsDeletedFalseOrderByNameAsc();

    Optional<Category> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlug(String slug);
}

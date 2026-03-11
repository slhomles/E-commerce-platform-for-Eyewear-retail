package com.e_commerce.glasses_store.modules.product.repository;

import com.e_commerce.glasses_store.modules.product.entity.Product;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * JPA Specification builder cho dynamic product filtering.
 * Mỗi method trả Specification để chain:
 * Specification.where(brand).and(price).and(gender)...
 */
public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> isActive() {
        return (root, query, cb) -> cb.and(
                cb.isTrue(root.get("isActive")),
                cb.isFalse(root.get("isDeleted")));
    }

    public static Specification<Product> hasBrand(String brandSlug) {
        if (!StringUtils.hasText(brandSlug))
            return null;
        return (root, query, cb) -> cb.equal(root.join("brand").get("slug"), brandSlug);
    }

    public static Specification<Product> hasCategory(String categorySlug) {
        if (!StringUtils.hasText(categorySlug))
            return null;
        return (root, query, cb) -> cb.equal(root.join("category").get("slug"), categorySlug);
    }

    public static Specification<Product> hasGender(String gender) {
        if (!StringUtils.hasText(gender))
            return null;
        return (root, query, cb) -> cb.equal(root.get("gender"),
                Product.Gender.valueOf(gender.toUpperCase()));
    }

    public static Specification<Product> hasType(String type) {
        if (!StringUtils.hasText(type))
            return null;
        return (root, query, cb) -> cb.equal(root.get("type"),
                Product.ProductType.valueOf(type.toUpperCase()));
    }

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min != null && max != null) {
                return cb.between(root.get("basePrice"), min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(root.get("basePrice"), min);
            } else if (max != null) {
                return cb.lessThanOrEqualTo(root.get("basePrice"), max);
            }
            return null;
        };
    }

    public static Specification<Product> hasFrameMaterial(String material) {
        if (!StringUtils.hasText(material))
            return null;
        return (root, query, cb) -> cb.equal(root.get("frameMaterial"), material);
    }

    public static Specification<Product> hasFrameShape(String shape) {
        if (!StringUtils.hasText(shape))
            return null;
        return (root, query, cb) -> cb.equal(root.get("frameShape"), shape);
    }

    public static Specification<Product> hasRimType(String rimType) {
        if (!StringUtils.hasText(rimType))
            return null;
        return (root, query, cb) -> cb.equal(root.get("rimType"), rimType);
    }

    public static Specification<Product> hasFrameSize(String size) {
        if (!StringUtils.hasText(size))
            return null;
        return (root, query, cb) -> cb.equal(root.get("frameSize"), size);
    }

    public static Specification<Product> hasStyle(String style) {
        if (!StringUtils.hasText(style))
            return null;
        return (root, query, cb) -> cb.equal(root.get("style"), style);
    }

    /**
     * Tìm sản phẩm đang có khuyến mãi.
     */
    public static Specification<Product> onSale() {
        return (root, query, cb) -> cb.isNotNull(root.get("salePrice"));
    }
}

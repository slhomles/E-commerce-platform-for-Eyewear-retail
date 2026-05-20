package com.e_commerce.glasses_store.modules.banner.repository;

import com.e_commerce.glasses_store.modules.banner.entity.Banner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String> {

    /**
     * Lấy banner đang active + đang trong thời gian hiển thị + theo vị trí,
     * sắp xếp theo position tăng dần.
     */
    @Query("SELECT b FROM Banner b " +
           "WHERE b.isActive = true " +
           "AND b.startDate <= :now " +
           "AND b.endDate >= :now " +
           "AND b.displayLocation = :location " +
           "ORDER BY b.position ASC")
    List<Banner> findActiveBannersByLocation(@Param("now") LocalDateTime now, @Param("location") Banner.DisplayLocation location);

    /**
     * Lấy banner đang active + đang trong thời gian hiển thị (tương thích cũ),
     * mặc định lấy HOME nếu gọi hàm này.
     */
    @Query("SELECT b FROM Banner b " +
           "WHERE b.isActive = true " +
           "AND b.startDate <= :now " +
           "AND b.endDate >= :now " +
           "ORDER BY b.position ASC")
    List<Banner> findActiveBanners(@Param("now") LocalDateTime now);

    /**
     * Admin: lấy tất cả banner kèm phân trang.
     */
    Page<Banner> findAllByOrderByPositionAsc(Pageable pageable);
}

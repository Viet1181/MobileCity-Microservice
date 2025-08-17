package com.nguyenquocviet.recommendationservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import com.nguyenquocviet.recommendationservice.model.Recommendation;

import java.util.List;

@Repository
@Transactional
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    @Query("select r FROM Recommendation r WHERE r.product.productName = :productName AND r.status = 'active'")
    List<Recommendation> findAllRatingByProductName(@Param("productName") String productName);

   
}

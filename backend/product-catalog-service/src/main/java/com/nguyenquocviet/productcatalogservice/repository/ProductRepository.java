package com.nguyenquocviet.productcatalogservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import com.nguyenquocviet.productcatalogservice.entity.Product;
import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.entity.Brand;

import java.util.List;
import java.math.BigDecimal;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
       @Query("SELECT DISTINCT p.category FROM Product p")
       List<Category> findDistinctCategories();

       @Query("SELECT DISTINCT p.brand FROM Product p")
       List<Brand> findDistinctBrands();

       @Query("SELECT p.category.name, COUNT(p) FROM Product p GROUP BY p.category.name")
       List<Object[]> getCategorySummary();

       @Query("SELECT p.brand.name, COUNT(p) FROM Product p GROUP BY p.brand.name")
       List<Object[]> getBrandSummary();

       public List<Product> findAllByCategory(Category category);

       public List<Product> findAllByBrand(Brand brand);

       public List<Product> findAllByProductName(String name);

       @Query("SELECT p FROM Product p WHERE " +
       "(:keyword IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
       "(:category IS NULL OR p.category = :category) AND " +
       "(:brand IS NULL OR p.brand = :brand) AND " +
       "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
       "(:maxPrice IS NULL OR p.price <= :maxPrice)")
List<Product> searchProducts(
        @Param("keyword") String keyword,
        @Param("category") Category category,
        @Param("brand") Brand brand,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Sort sort);

       
}
                     
                     
                     
                     
       
                     
                     
                     
                     
                     
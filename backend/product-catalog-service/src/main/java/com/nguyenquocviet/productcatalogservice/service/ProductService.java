package com.nguyenquocviet.productcatalogservice.service;

import java.util.List;
import java.math.BigDecimal;

import com.nguyenquocviet.productcatalogservice.entity.Product;
import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.entity.Brand;

public interface ProductService {
    List<Category> getAllCategories();
    boolean hasProductBeenOrdered(Long productId);

    java.util.Map<String, Long> getCategorySummary();
    public List<Product> getAllProduct();
    public List<Product> getAllProductByCategory(Long categoryId);
    public List<Product> getAllProductByBrand(Long brandId);
    public Product getProductById(Long id);
    public List<Product> getAllProductsByName(String name);
    public Product addProduct(Product product);
    public Product updateProduct(Long id, Product product);
    public void deleteProduct(Long productId);
    public List<Product> searchProducts(String keyword, Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, String sortBy, String order);
}

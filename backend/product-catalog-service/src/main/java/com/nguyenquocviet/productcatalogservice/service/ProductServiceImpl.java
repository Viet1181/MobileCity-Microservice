package com.nguyenquocviet.productcatalogservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;

import com.nguyenquocviet.productcatalogservice.entity.Product;
import com.nguyenquocviet.productcatalogservice.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private com.nguyenquocviet.productcatalogservice.feignclient.OrderItemClient orderItemClient;

    @Autowired
    private com.nguyenquocviet.productcatalogservice.repository.BrandRepository brandRepository;
    @Autowired
    private com.nguyenquocviet.productcatalogservice.repository.CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.nguyenquocviet.productcatalogservice.service.ImageService imageService;


    @Override
    public List<com.nguyenquocviet.productcatalogservice.entity.Category> getAllCategories() {
        return productRepository.findDistinctCategories();
    }

    public List<com.nguyenquocviet.productcatalogservice.entity.Brand> getAllBrands() {
        return productRepository.findDistinctBrands();
    }

    @Override
    public boolean hasProductBeenOrdered(Long productId) {
        // Gọi sang order-service qua FeignClient
        try {
            return orderItemClient.existsByProductId(productId);
        } catch (Exception e) {
            // Nếu lỗi (ví dụ không kết nối được), mặc định KHÔNG cho xóa
            return true;
        }
    }

    @Override
    public java.util.Map<String, Long> getCategorySummary() {
        List<Object[]> raw = productRepository.getCategorySummary();
        java.util.Map<String, Long> map = new java.util.HashMap<>();
        for (Object[] row : raw) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    @Override
    public List<Product> getAllProduct() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getAllProductByCategory(Long categoryId) {
        com.nguyenquocviet.productcatalogservice.entity.Category category = categoryRepository.findById(categoryId)
                .orElse(null);
        if (category == null)
            return java.util.Collections.emptyList();
        return productRepository.findAllByCategory(category);
    }

    @Override
    public List<Product> getAllProductByBrand(Long brandId) {
        com.nguyenquocviet.productcatalogservice.entity.Brand brand = brandRepository.findById(brandId).orElse(null);
        if (brand == null)
            return java.util.Collections.emptyList();
        return productRepository.findAllByBrand(brand);
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    public List<Product> getAllProductsByName(String name) {
        return productRepository.findAllByProductName(name);
    }

    @Override
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }


    @Override
    public void deleteProduct(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return;
        if (orderItemClient.existsByProductId(productId)) {
            throw new RuntimeException("Không thể xóa sản phẩm vì đã có đơn hàng chứa sản phẩm này!");
        }
        String imageUrl = product.getImageUrl(); 
        try {
            productRepository.deleteById(productId);
            // Kiểm tra lại: nếu sản phẩm đã thực sự bị xóa khỏi DB thì mới xóa file ảnh
            boolean stillExists = productRepository.existsById(productId);
            if (!stillExists && imageUrl != null && !imageUrl.isEmpty()) {
                try {
                    imageService.deleteImage(imageUrl);
                } catch (IOException ex) {
                    // Log lỗi nếu cần, không throw ra ngoài
                    ex.printStackTrace();
                }
            }
        } catch (Exception e) {
            // Không xóa ảnh nếu xóa DB lỗi
            throw e;
        }
    }

    @Override
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id).orElse(null);
        if (existingProduct != null) {
            existingProduct.setProductName(updatedProduct.getProductName());
            existingProduct.setPrice(updatedProduct.getPrice());
            existingProduct.setDescription(updatedProduct.getDescription());
            existingProduct.setCategory(updatedProduct.getCategory());
            existingProduct.setBrand(updatedProduct.getBrand());
            existingProduct.setAvailability(updatedProduct.getAvailability());
            existingProduct.setImageUrl(updatedProduct.getImageUrl());
            return productRepository.save(existingProduct);
        }
        return null;
    }

    @Override
    public List<Product> searchProducts(String keyword, Long categoryId, Long brandId, BigDecimal minPrice, BigDecimal maxPrice, String sortBy, String order) {

        try {
            // Validate price range
            if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Giá tối thiểu không được âm");
            }
            if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Giá tối đa không được âm");
            }
            if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
                throw new IllegalArgumentException("Giá tối thiểu không được lớn hơn giá tối đa");
            }

            // Valid
        String normalizedDirection = (order != null ? order : "asc").toLowerCase();
        if (!normalizedDirection.equals("asc") && !normalizedDirection.equals("desc")) {
            normalizedDirection = "asc"; // Default to ascending if invalid
        }
        Sort.Direction direction = Sort.Direction.fromString(normalizedDirection);

        // Validate sort field
        if (!isValidSortField(sortBy)) {
            sortBy = "id"; // Default to id if invalid
        }

        Sort sort = Sort.by(direction, sortBy);

        // Resolve category and brand entities
        com.nguyenquocviet.productcatalogservice.entity.Category category = null;
        if (categoryId != null) {
            category = categoryRepository.findById(categoryId).orElse(null);
        }
        com.nguyenquocviet.productcatalogservice.entity.Brand brand = null;
        if (brandId != null) {
            brand = brandRepository.findById(brandId).orElse(null);
        }

        return productRepository.searchProducts(keyword, category, brand, minPrice, maxPrice, sort);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tìm kiếm sản phẩm: " + e.getMessage());
        }
    }

    private boolean isValidSortField(String field) {
        return field != null && (
            field.equals("id") ||
            field.equals("productName") ||
            field.equals("price") ||
            field.equals("category") ||
            field.equals("brand")
        );
    }
}
                
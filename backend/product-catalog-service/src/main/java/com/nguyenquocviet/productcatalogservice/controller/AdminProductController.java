package com.nguyenquocviet.productcatalogservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.nguyenquocviet.productcatalogservice.dto.ProductDTO;
import com.nguyenquocviet.productcatalogservice.entity.Product;
import com.nguyenquocviet.productcatalogservice.http.header.HeaderGenerator;
import com.nguyenquocviet.productcatalogservice.service.ImageService;
import com.nguyenquocviet.productcatalogservice.service.ProductService;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.math.BigDecimal;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/admin/products")
public class AdminProductController {

    @Autowired
    private com.nguyenquocviet.productcatalogservice.repository.CategoryRepository categoryRepository;

    @Autowired
    private com.nguyenquocviet.productcatalogservice.repository.BrandRepository brandRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private HeaderGenerator headerGenerator;

    // Thêm sản phẩm mới
   @PostMapping(consumes = { MULTIPART_FORM_DATA_VALUE })
public ResponseEntity<ProductDTO> addProduct(
        @RequestParam("productName") String productName,
        @RequestParam("price") BigDecimal price,
        @RequestParam("description") String description,
        @RequestParam("categoryId") Long categoryId,
        @RequestParam("brandId") Long brandId,
        @RequestParam("availability") int availability,
        @RequestPart(value = "image", required = false) MultipartFile image,
        HttpServletRequest request) {
    try {
        var category = categoryRepository.findById(categoryId).orElse(null);
        if (category == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        var brand = brandRepository.findById(brandId).orElse(null);
        if (brand == null) {
            return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
        }
        Product product = new Product();
        product.setProductName(productName);
        product.setPrice(price);
        product.setDescription(description);
        product.setCategory(category);
        product.setBrand(brand);
        product.setAvailability(availability);

        if (image != null && !image.isEmpty()) {
            String imageFileName = imageService.storeImage(image);
            product.setImageUrl(imageFileName);
        }

        Product savedProduct = productService.addProduct(product);

        // Tạo ProductDTO từ Product entity
        ProductDTO dto = new ProductDTO();
        dto.setId(savedProduct.getId());
        dto.setProductName(savedProduct.getProductName());
        dto.setPrice(savedProduct.getPrice());
        dto.setDescription(savedProduct.getDescription());
        dto.setImageUrl(savedProduct.getImageUrl());
        dto.setAvailability(savedProduct.getAvailability());
        dto.setCategoryId(category.getId());
        dto.setCategoryName(category.getName());
        dto.setBrandId(brand.getId());
        dto.setBrandName(brand.getName());

        return new ResponseEntity<>(
                dto,
                headerGenerator.getHeadersForSuccessPostMethod(request, dto.getId()),
                HttpStatus.CREATED);
    } catch (IOException e) {
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
    // Cập nhật sản phẩm
    @PutMapping(value = "/{id}", consumes = { MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") Long id,
            @RequestParam("productName") String productName,
            @RequestParam("price") BigDecimal price,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("brandId") Long brandId,
            @RequestParam("availability") int availability,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            Product existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }
            var category = categoryRepository.findById(categoryId).orElse(null);
            if (category == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
            }
            var brand = brandRepository.findById(brandId).orElse(null);
            if (brand == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
            }
            existingProduct.setProductName(productName);
            existingProduct.setPrice(price);
            existingProduct.setDescription(description);
            existingProduct.setCategory(category);
            existingProduct.setBrand(brand);
            existingProduct.setAvailability(availability);

            // Xử lý ảnh mới (nếu có)
            if (image != null && !image.isEmpty()) {
                if (existingProduct.getImageUrl() != null) {
                    imageService.deleteImage(existingProduct.getImageUrl());
                }
                String imageFileName = imageService.storeImage(image);
                existingProduct.setImageUrl(imageFileName);
            }

            Product updatedProduct = productService.updateProduct(id, existingProduct);
            return new ResponseEntity<>(
                    updatedProduct,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Kiểm tra sản phẩm đã từng được đặt chưa
    @GetMapping("/{id}/ordered")
    public ResponseEntity<?> checkProductOrdered(@PathVariable("id") Long id) {
        boolean ordered = productService.hasProductBeenOrdered(id);
        return ResponseEntity.ok(java.util.Collections.singletonMap("ordered", ordered));
    }

    // Xóa sản phẩm
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        try {
            Product product = productService.getProductById(id);
            if (product == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }
            if (product.getImageUrl() != null) {
                imageService.deleteImage(product.getImageUrl());
            }
            productService.deleteProduct(id);
            return new ResponseEntity<>(
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
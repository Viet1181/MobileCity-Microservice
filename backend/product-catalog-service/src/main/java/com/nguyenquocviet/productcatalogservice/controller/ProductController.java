package com.nguyenquocviet.productcatalogservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nguyenquocviet.productcatalogservice.entity.Product;
import com.nguyenquocviet.productcatalogservice.http.header.HeaderGenerator;
import com.nguyenquocviet.productcatalogservice.service.ProductService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
public class ProductController {
    // Chuyển đổi Product entity sang ProductDTO
    private com.nguyenquocviet.productcatalogservice.dto.ProductDTO convertToDTO(Product product) {
        com.nguyenquocviet.productcatalogservice.dto.ProductDTO dto = new com.nguyenquocviet.productcatalogservice.dto.ProductDTO();
        dto.setId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setPrice(product.getPrice());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl());
        dto.setAvailability(product.getAvailability());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getId());
            dto.setBrandName(product.getBrand().getName());
        }
        return dto;
    }

 

    @Autowired
    private ProductService productService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/products")
    public ResponseEntity<List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO>> getAllProducts() {
        List<Product> products = productService.getAllProduct();
        List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO> dtos = new ArrayList<>();
        for (Product product : products) {
            dtos.add(convertToDTO(product));
        }
        if (!dtos.isEmpty()) {
            return new ResponseEntity<>(
                    dtos,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products", params = "categoryId")
    public ResponseEntity<List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO>> getAllProductByCategory(@RequestParam("categoryId") Long categoryId) {
        List<Product> products = productService.getAllProductByCategory(categoryId);
        List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO> dtos = new ArrayList<>();
        for (Product product : products) {
            dtos.add(convertToDTO(product));
        }
        if (!dtos.isEmpty()) {
            return new ResponseEntity<>(
                    dtos,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products", params = "brandId")
    public ResponseEntity<List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO>> getAllProductByBrand(@RequestParam("brandId") Long brandId) {
        List<Product> products = productService.getAllProductByBrand(brandId);
        List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO> dtos = new ArrayList<>();
        for (Product product : products) {
            dtos.add(convertToDTO(product));
        }
        if (!dtos.isEmpty()) {
            return new ResponseEntity<>(
                    dtos,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/{id}")
    public ResponseEntity<com.nguyenquocviet.productcatalogservice.dto.ProductDTO> getOneProductById(@PathVariable("id") long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return new ResponseEntity<>(
                    convertToDTO(product),
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products", params = "name")
    public ResponseEntity<List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO>> getAllProductsByName(@RequestParam("name") String name) {
        List<Product> products = productService.getAllProductsByName(name);
        List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO> dtos = new ArrayList<>();
        for (Product product : products) {
            dtos.add(convertToDTO(product));
        }
        if (!dtos.isEmpty()) {
            return new ResponseEntity<>(
                    dtos,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/products/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "brandId", required = false) Long brandId,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "order", required = false) String order) {
        try {
            List<Product> products = productService.searchProducts(keyword, categoryId, brandId, minPrice, maxPrice, sortBy, order);
            List<com.nguyenquocviet.productcatalogservice.dto.ProductDTO> dtos = new ArrayList<>();
            for (Product product : products) {
                dtos.add(convertToDTO(product));
            }
            return new ResponseEntity<>(
                    dtos,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        } catch (NumberFormatException e) {
            return new ResponseEntity<>(
                    Collections.singletonMap("error", "Giá trị giá không hợp lệ"),
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(
                    Collections.singletonMap("error", e.getMessage()),
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST);
        }
    }
        // API cập nhật tồn kho cho order-service
        @PutMapping("/products/{id}/availability")
    public ResponseEntity<Product> updateAvailability(
            @PathVariable("id") Long id,
            @RequestParam("availability") int availability) {
            Product product = productService.getProductById(id);
            if (product == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            product.setAvailability(availability);
            Product updated = productService.updateProduct(id, product);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        }

}

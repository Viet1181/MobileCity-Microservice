package com.nguyenquocviet.productcatalogservice.controller;

import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {
    // Chuyển đổi Category entity sang CategoryDTO
    private com.nguyenquocviet.productcatalogservice.dto.CategoryDTO convertToDTO(Category category) {
        com.nguyenquocviet.productcatalogservice.dto.CategoryDTO dto = new com.nguyenquocviet.productcatalogservice.dto.CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setImageUrl(category.getImageUrl());
        if (category.getBrands() != null) {
            dto.setBrandIds(category.getBrands().stream().map(b -> b.getId()).collect(java.util.stream.Collectors.toList()));
        }
        return dto;
    }
    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public java.util.List<com.nguyenquocviet.productcatalogservice.dto.CategoryDTO> getAllCategories() {
        java.util.List<Category> categories = categoryService.getAllCategories();
        java.util.List<com.nguyenquocviet.productcatalogservice.dto.CategoryDTO> dtos = new java.util.ArrayList<>();
        for (Category category : categories) {
            dtos.add(convertToDTO(category));
        }
        return dtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.nguyenquocviet.productcatalogservice.dto.CategoryDTO> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        return category != null ? ResponseEntity.ok(convertToDTO(category)) : ResponseEntity.notFound().build();
    }
}

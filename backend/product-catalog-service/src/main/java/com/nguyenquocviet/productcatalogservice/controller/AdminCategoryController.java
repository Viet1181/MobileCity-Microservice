package com.nguyenquocviet.productcatalogservice.controller;

import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.service.CategoryService;
import com.nguyenquocviet.productcatalogservice.dto.CategoryDTO;
import com.nguyenquocviet.productcatalogservice.entity.Brand;
import java.util.stream.Collectors;
import com.nguyenquocviet.productcatalogservice.service.ImageService;
import com.nguyenquocviet.productcatalogservice.http.header.HeaderGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/admin/categories")
public class AdminCategoryController {
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private ImageService imageService;
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<CategoryDTO> dtos = new java.util.ArrayList<>();
        for (Category category : categories) {
            CategoryDTO dto = new CategoryDTO();
            dto.setId(category.getId());
            dto.setName(category.getName());
            dto.setDescription(category.getDescription());
            dto.setImageUrl(category.getImageUrl());
            if (category.getBrands() != null) {
                dto.setBrandIds(category.getBrands().stream().map(b -> b.getId()).collect(java.util.stream.Collectors.toList()));
            }
            dtos.add(dto);
        }
        return dtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category == null) return ResponseEntity.notFound().build();
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setImageUrl(category.getImageUrl());
        if (category.getBrands() != null) {
            dto.setBrandIds(category.getBrands().stream().map(Brand::getId).collect(Collectors.toList()));
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CategoryDTO categoryDTO) {
        Category created = categoryService.addCategory(categoryDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = { MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam(value = "brandIds", required = false) List<Long> brandIds,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            // Lấy lại dữ liệu cũ để giữ lại các trường không gửi lên (nếu cần)
            Category old = categoryService.getCategoryById(id);
            if (old == null) return ResponseEntity.notFound().build();

            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setId(id);
            categoryDTO.setName(name);
            categoryDTO.setDescription(description);
            if (brandIds != null) {
                categoryDTO.setBrandIds(brandIds);
            } else if (old.getBrands() != null) {
                categoryDTO.setBrandIds(old.getBrands().stream().map(b -> b.getId()).collect(java.util.stream.Collectors.toList()));
            }
            if (image != null) {
                String imageUrl = imageService.storeImage(image);
                categoryDTO.setImageUrl(imageUrl);
            } else {
                categoryDTO.setImageUrl(old.getImageUrl());
            }

            Category updated = categoryService.updateCategory(id, categoryDTO);
            if (updated == null) return ResponseEntity.notFound().build();
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("imageUrl", updated.getImageUrl());
            response.put("data", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log lỗi chi tiết ra console
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", "Lỗi cập nhật category: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping(value = "/{id}/image", consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Category> uploadCategoryImage(@PathVariable Long id,
            @RequestPart("image") MultipartFile image) {
        Category category = categoryService.getCategoryById(id);
        if (category == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        try {
            String imageUrl = imageService.storeImage(image);
            category.setImageUrl(imageUrl);
            // Chuyển sang dùng CategoryDTO để tương thích với service mới
            CategoryDTO dto = new CategoryDTO();
            dto.setId(category.getId());
            dto.setName(category.getName());
            dto.setDescription(category.getDescription());
            dto.setImageUrl(imageUrl);
            if (category.getBrands() != null) {
                dto.setBrandIds(category.getBrands().stream().map(b -> b.getId()).collect(java.util.stream.Collectors.toList()));
            }
            Category updated = categoryService.updateCategory(id, dto);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

package com.nguyenquocviet.productcatalogservice.controller;

import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.service.BrandService;
import com.nguyenquocviet.productcatalogservice.dto.BrandDTO;
import com.nguyenquocviet.productcatalogservice.entity.Category;
import java.util.stream.Collectors;
import com.nguyenquocviet.productcatalogservice.service.ImageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;
import com.nguyenquocviet.productcatalogservice.http.header.HeaderGenerator;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;

@RestController
@RequestMapping("/admin/brands")
public class AdminBrandController {
    @Autowired
    private BrandService brandService;
    @Autowired
    private ImageService imageService;
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping
    public List<BrandDTO> getAllBrands() {
        List<Brand> brands = brandService.getBrands();
        List<BrandDTO> dtos = new java.util.ArrayList<>();
        for (Brand brand : brands) {
            BrandDTO dto = new BrandDTO();
            dto.setId(brand.getId());
            dto.setName(brand.getName());
            dto.setDescription(brand.getDescription());
            dto.setImageUrl(brand.getImageUrl());
            if (brand.getCategories() != null) {
                dto.setCategoryIds(brand.getCategories().stream().map(c -> c.getId()).collect(java.util.stream.Collectors.toList()));
            }
            dtos.add(dto);
        }
        return dtos;
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        if (brand == null) return ResponseEntity.notFound().build();
        BrandDTO dto = new BrandDTO();
        dto.setId(brand.getId());
        dto.setName(brand.getName());
        dto.setDescription(brand.getDescription());
        dto.setImageUrl(brand.getImageUrl());
        if
         (brand.getCategories() != null) {
            dto.setCategoryIds(brand.getCategories().stream().map(Category::getId).collect(Collectors.toList()));
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBrand(@RequestBody BrandDTO brandDTO) {
        Brand created = brandService.createBrand(brandDTO);
        if (created == null || created.getId() == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", "Create failed"));
        }
        BrandDTO dto = new BrandDTO();
        dto.setId(created.getId());
        dto.setName(created.getName());
        dto.setDescription(created.getDescription());
        dto.setImageUrl(created.getImageUrl());
        if (created.getCategories() != null) {
            dto.setCategoryIds(created.getCategories().stream().map(c -> c.getId()).collect(java.util.stream.Collectors.toList()));
        }
        Map<String, Object> data = new HashMap<>();
        data.put("id", dto.getId());
        data.put("name", dto.getName());
        data.put("description", dto.getDescription());
        data.put("imageUrl", dto.getImageUrl());
        data.put("categoryIds", dto.getCategoryIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(Collections.singletonMap("data", data));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
public ResponseEntity<Map<String, Object>> updateBrand(
        @PathVariable Long id,
        @RequestParam(value = "name", required = false) String name,
        @RequestParam(value = "description", required = false) String description,
        @RequestParam(value = "categoryIds", required = false) List<Long> categoryIds,
        @RequestPart(value = "image", required = false) MultipartFile image) {
    try {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = imageService.storeImage(image);
        }
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setId(id);
        brandDTO.setName(name);
        brandDTO.setDescription(description);
        brandDTO.setCategoryIds(categoryIds);
        if (imageUrl != null) {
            brandDTO.setImageUrl(imageUrl);
        }
        Brand updated = brandService.updateBrand(id, brandDTO);
        if (updated == null || updated.getId() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Not found"));
        }
        BrandDTO dto = new BrandDTO();
        dto.setId(updated.getId());
        dto.setName(updated.getName());
        dto.setDescription(updated.getDescription());
        dto.setImageUrl(updated.getImageUrl());
        if (updated.getCategories() != null) {
            dto.setCategoryIds(updated.getCategories().stream().map(c -> c.getId()).collect(java.util.stream.Collectors.toList()));
        }
        Map<String, Object> data = new HashMap<>();
        data.put("id", dto.getId());
        data.put("name", dto.getName());
        data.put("description", dto.getDescription());
        data.put("imageUrl", dto.getImageUrl());
        data.put("categoryIds", dto.getCategoryIds());
        return ResponseEntity.ok(Collections.singletonMap("data", data));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.singletonMap("error", "Lỗi cập nhật brand: " + e.getMessage()));
    }
}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        if (brandService.hasProductsByBrandId(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Không thể xóa thương hiệu vì vẫn còn sản phẩm thuộc thương hiệu này!");
        }
        brandService.deleteBrand(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping(value = "/{id}/image", consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<java.util.Map<String, Object>> uploadBrandImage(@PathVariable Long id, @RequestPart("image") MultipartFile image) {
        Brand brand = brandService.getBrandById(id);
        if (brand == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        try {
            String imageUrl = imageService.storeImage(image);
            brand.setImageUrl(imageUrl);
            // Lưu lại brand với imageUrl mới
            BrandDTO dto = new BrandDTO();
            dto.setId(brand.getId());
            dto.setName(brand.getName());
            dto.setDescription(brand.getDescription());
            dto.setImageUrl(imageUrl);
            if (brand.getCategories() != null) {
                dto.setCategoryIds(brand.getCategories().stream().map(c -> c.getId()).collect(java.util.stream.Collectors.toList()));
            }
            brandService.updateBrand(id, dto);
            // Trả về đúng chuẩn cho frontend
            java.util.Map<String, Object> data = new java.util.HashMap<>();
            data.put("imageUrl", imageUrl);
            return ResponseEntity.ok(java.util.Collections.singletonMap("data", data));
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

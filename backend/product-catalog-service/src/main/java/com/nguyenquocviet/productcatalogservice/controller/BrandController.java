package com.nguyenquocviet.productcatalogservice.controller;

import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandController {
    // Chuyển đổi Brand entity sang BrandDTO
    private com.nguyenquocviet.productcatalogservice.dto.BrandDTO convertToDTO(Brand brand) {
        com.nguyenquocviet.productcatalogservice.dto.BrandDTO dto = new com.nguyenquocviet.productcatalogservice.dto.BrandDTO();
        dto.setId(brand.getId());
        dto.setName(brand.getName());
        dto.setDescription(brand.getDescription());
        dto.setImageUrl(brand.getImageUrl());
        if (brand.getCategories() != null) {
            dto.setCategoryIds(brand.getCategories().stream().map(c -> c.getId()).collect(java.util.stream.Collectors.toList()));
        }
        return dto;
    }
    @Autowired
    private BrandService brandService;

    @GetMapping
    public ResponseEntity<List<com.nguyenquocviet.productcatalogservice.dto.BrandDTO>> getAllBrands() {
        List<Brand> brands = brandService.getBrands();
        List<com.nguyenquocviet.productcatalogservice.dto.BrandDTO> dtos = new java.util.ArrayList<>();
        for (Brand brand : brands) {
            dtos.add(convertToDTO(brand));
        }
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.nguyenquocviet.productcatalogservice.dto.BrandDTO> getBrandById(@PathVariable Long id) {
        Brand brand = brandService.getBrandById(id);
        return brand != null ? ResponseEntity.ok(convertToDTO(brand)) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<java.util.Map<String, Object>> createBrand(@RequestBody com.nguyenquocviet.productcatalogservice.dto.BrandDTO brandDTO) {
        Brand created = brandService.createBrand(brandDTO);
        if (created == null || created.getId() == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Collections.singletonMap("error", "Create failed"));
        }
        com.nguyenquocviet.productcatalogservice.dto.BrandDTO dto = convertToDTO(created);
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("id", dto.getId());
        data.put("name", dto.getName());
        data.put("description", dto.getDescription());
        data.put("imageUrl", dto.getImageUrl());
        data.put("categoryIds", dto.getCategoryIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(java.util.Collections.singletonMap("data", data));
    }
}

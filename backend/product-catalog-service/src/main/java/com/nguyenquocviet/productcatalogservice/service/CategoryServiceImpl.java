package com.nguyenquocviet.productcatalogservice.service;

import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.repository.CategoryRepository;
import com.nguyenquocviet.productcatalogservice.dto.CategoryDTO;
import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private BrandRepository brandRepository;

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public Category addCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setImageUrl(categoryDTO.getImageUrl());
        if (categoryDTO.getBrandIds() != null) {
            category.setBrands(brandRepository.findAllById(categoryDTO.getBrandIds()));
        }
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, CategoryDTO categoryDTO) {
        Category existing = getCategoryById(id);
        if (existing != null) {
            // Luôn cập nhật name, kể cả khi là chuỗi rỗng
            if (categoryDTO.getName() != null) {
                existing.setName(categoryDTO.getName());
            }
            // Luôn cập nhật description, kể cả khi là chuỗi rỗng
            if (categoryDTO.getDescription() != null) {
                existing.setDescription(categoryDTO.getDescription());
            }
            // Luôn cập nhật imageUrl, kể cả khi là chuỗi rỗng (xóa ảnh)
            if (categoryDTO.getImageUrl() != null) {
                existing.setImageUrl(categoryDTO.getImageUrl());
            }
            // Nếu brandIds truyền lên (kể cả mảng rỗng), cập nhật lại brands
            if (categoryDTO.getBrandIds() != null) {
                if (categoryDTO.getBrandIds().isEmpty()) {
                    existing.setBrands(new java.util.ArrayList<>());
                } else {
                    existing.setBrands(brandRepository.findAllById(categoryDTO.getBrandIds()));
                }
            }
            return categoryRepository.save(existing);
        }
        return null;
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) return;
        // Nếu còn brand liên kết thì không cho xóa
        if (category.getBrands() != null && !category.getBrands().isEmpty()) {
            throw new IllegalStateException("Không thể xóa category khi còn thương hiệu liên kết!");
        }
        categoryRepository.deleteById(id);
    }
}

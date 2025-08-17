package com.nguyenquocviet.productcatalogservice.service;

import com.nguyenquocviet.productcatalogservice.entity.Category;
import java.util.List;

import com.nguyenquocviet.productcatalogservice.dto.CategoryDTO;

public interface CategoryService {
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
    Category addCategory(CategoryDTO categoryDTO);
    Category updateCategory(Long id, CategoryDTO categoryDTO);
    void deleteCategory(Long id);
}

package com.nguyenquocviet.productcatalogservice.service;

import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.repository.BrandRepository;
import com.nguyenquocviet.productcatalogservice.dto.BrandDTO;
import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.repository.CategoryRepository;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.nguyenquocviet.productcatalogservice.repository.ProductRepository;

@Service
public class BrandServiceImpl implements BrandService {
    @Autowired
    private com.nguyenquocviet.productcatalogservice.repository.ProductRepository productRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public Brand createBrand(BrandDTO brandDTO) {
        Brand brand = new Brand();
        brand.setName(brandDTO.getName());
        brand.setDescription(brandDTO.getDescription());
        brand.setImageUrl(brandDTO.getImageUrl());
        if (brandDTO.getCategoryIds() != null) {
            brand.setCategories(categoryRepository.findAllById(brandDTO.getCategoryIds()));
        }
        return brandRepository.save(brand);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public Brand updateBrand(Long id, BrandDTO brandDTO) {
        Optional<Brand> existing = brandRepository.findById(id);
        if (existing.isPresent()) {
            Brand b = existing.get();
            // DEBUG: Log các giá trị truyền vào
            System.out.println("[BrandServiceImpl] updateBrand id=" + id);
            System.out.println("  name=" + brandDTO.getName());
            System.out.println("  description=" + brandDTO.getDescription());
            System.out.println("  imageUrl=" + brandDTO.getImageUrl());
            System.out.println("  categoryIds=" + brandDTO.getCategoryIds());
            // Luôn cập nhật name, kể cả khi là chuỗi rỗng
            if (brandDTO.getName() != null) {
                b.setName(brandDTO.getName());
            }
            // Luôn cập nhật description, kể cả khi là chuỗi rỗng
            if (brandDTO.getDescription() != null) {
                b.setDescription(brandDTO.getDescription());
            }
            // Luôn cập nhật imageUrl, kể cả khi là chuỗi rỗng (xóa ảnh)
            if (brandDTO.getImageUrl() != null) {
                System.out.println("  => Đang cập nhật imageUrl cho brand: " + brandDTO.getImageUrl());
                b.setImageUrl(brandDTO.getImageUrl());
            }
            // Nếu categoryIds truyền lên (kể cả mảng rỗng), cập nhật lại categories
            if (brandDTO.getCategoryIds() != null) {
                if (brandDTO.getCategoryIds().isEmpty()) {
                    b.setCategories(new java.util.ArrayList<>());
                } else {
                    b.setCategories(categoryRepository.findAllById(brandDTO.getCategoryIds()));
                }
            }
            return brandRepository.save(b);
        }
        return null;
    }

    @Override
    public void deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id).orElse(null);
        if (brand == null) return;
        // Xóa toàn bộ liên kết với category trước khi xóa brand
        if (brand.getCategories() != null && !brand.getCategories().isEmpty()) {
            brand.getCategories().clear();
            brandRepository.save(brand); // cập nhật lại để xóa liên kết trong bảng trung gian
        }
        brandRepository.deleteById(id);
    }

    @Override
    public Brand getBrandById(Long id) {
        return brandRepository.findById(id).orElse(null);
    }

    @Override
    public List<Brand> getBrands() {
        return brandRepository.findAll();
    }
    // Đã xóa getAllBrands() để đồng bộ với interface

    @Override
    public boolean hasProductsByBrandId(Long brandId) {
        Brand brand = brandRepository.findById(brandId).orElse(null);
        if (brand == null) return false;
        return !productRepository.findAllByBrand(brand).isEmpty();
    }
}

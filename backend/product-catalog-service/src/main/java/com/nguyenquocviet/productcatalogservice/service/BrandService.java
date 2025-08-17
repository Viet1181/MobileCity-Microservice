package com.nguyenquocviet.productcatalogservice.service;

import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.dto.BrandDTO;
import java.util.List;

public interface BrandService {
    Brand createBrand(BrandDTO brandDTO);
    Brand updateBrand(Long id, BrandDTO brandDTO);
    void deleteBrand(Long id);
    Brand getBrandById(Long id);
    List<Brand> getBrands(); // Thêm lại method trả về danh sách Brand
    // Kiểm tra thương hiệu còn sản phẩm không
    boolean hasProductsByBrandId(Long brandId);
}

package com.nguyenquocviet.productcatalogservice.controller;

import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.service.BrandService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import java.util.ArrayList;
import java.util.List;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class BrandControllerTests {
    private static final Long BRAND_ID = 1L;
    private static final String BRAND_NAME = "testBrand";
    private List<Brand> brands;
    private Brand brand;
    @Mock
    private BrandService brandService;
    @InjectMocks
    private BrandController brandController;
    @Before
    public void setUp() {
        brand = new Brand();
        brand.setId(BRAND_ID);
        brand.setName(BRAND_NAME);
        brands = new ArrayList<>();
        brands.add(brand);
    }
    @Test
    public void get_all_brands_test() {
        Mockito.when(brandService.getBrands()).thenReturn(brands);
        List<com.nguyenquocviet.productcatalogservice.dto.BrandDTO> found = brandController.getAllBrands().getBody();
        assertNotNull(found);
        assertEquals(found.size(), 1);
        assertEquals(found.get(0).getName(), BRAND_NAME);
        assertEquals(found.get(0).getId(), BRAND_ID);
        Mockito.verify(brandService, Mockito.times(1)).getBrands();
        Mockito.verifyNoMoreInteractions(brandService);
    }
}

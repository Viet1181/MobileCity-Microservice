package com.nguyenquocviet.productcatalogservice.service;

import org.junit.Before;
import org.junit.*;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import com.nguyenquocviet.productcatalogservice.entity.Product;
import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.repository.ProductRepository;
import com.nguyenquocviet.productcatalogservice.service.ProductServiceImpl;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.any;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ProductServiceTests {

    private static final String PRODUCT_NAME= "test";
    private static final Long PRODUCT_ID = 5L;
    private static final Long PRODUCT_CATEGORY_ID = 1L;
    private static final String PRODUCT_CATEGORY_NAME = "testCategory";
    private static final Long PRODUCT_BRAND_ID = 2L;
    private static final String PRODUCT_BRAND_NAME = "testBrand";

    private List<Product> products;
    private Product product;
    private Category category;
    private Brand brand;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @Before
    public void setUp(){
        category = new Category();
        category.setId(PRODUCT_CATEGORY_ID);
        category.setName(PRODUCT_CATEGORY_NAME);
        brand = new Brand();
        brand.setId(PRODUCT_BRAND_ID);
        brand.setName(PRODUCT_BRAND_NAME);
        product = new Product();
        product.setId(PRODUCT_ID);
        product.setProductName(PRODUCT_NAME);
        product.setCategory(category);
        product.setBrand(brand);
        products = new ArrayList<>();
        products.add(product);
    }

    @Test
    public void get_all_product_test(){
        // Data preparation
        String productName = PRODUCT_NAME;

        Mockito.when(productRepository.findAll()).thenReturn(products);

        // Method call
        List<Product> foundProducts = productService.getAllProduct();

        // Verification
        assertEquals(foundProducts.get(0).getProductName(), productName);
        Mockito.verify(productRepository, Mockito.times(1)).findAll();
        Mockito.verifyNoMoreInteractions(productRepository);
    }

    @Test
    public void get_one_by_id_test(){
        // Data preparation
        Mockito.when(productRepository.getOne(PRODUCT_ID)).thenReturn(product);

        // Method call
        Product found = productService.getProductById(PRODUCT_ID);

        // Verification
        assertEquals(found.getId(), PRODUCT_ID);
        Mockito.verify(productRepository, Mockito.times(1)).getOne(Mockito.anyLong());
        Mockito.verifyNoMoreInteractions(productRepository);
    }

    @Test
    public void get_all_product_by_category_test(){
        // Data preparation
        Mockito.when(productRepository.findAllByCategory(category)).thenReturn(products);

        //Method call
        List<Product> foundProducts = productService.getAllProductByCategory(PRODUCT_CATEGORY_ID);

        //Verification
        assertEquals(products.get(0).getCategory().getId(), PRODUCT_CATEGORY_ID);
        assertEquals(products.get(0).getProductName(), PRODUCT_NAME);
        Mockito.verify(productRepository, Mockito.times(1)).findAllByCategory(Mockito.any(Category.class));
        Mockito.verifyNoMoreInteractions(productRepository);
    }

    @Test
    public void get_all_products_by_name_test(){
        // Data preparation
        Mockito.when(productRepository.findAllByProductName(PRODUCT_NAME)).thenReturn(products);

        //Method call
        List<Product> foundProducts = productService.getAllProductsByName(PRODUCT_NAME);

        //Verification
        assertEquals(foundProducts.get(0).getProductName(), PRODUCT_NAME);
        Mockito.verify(productRepository, Mockito.times(1)).findAllByProductName(Mockito.anyString());
        Mockito.verifyNoMoreInteractions(productRepository);
    }

}

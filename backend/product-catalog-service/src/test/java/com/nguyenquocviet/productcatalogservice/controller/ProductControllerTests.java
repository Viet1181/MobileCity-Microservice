package com.nguyenquocviet.productcatalogservice.controller;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import com.nguyenquocviet.productcatalogservice.entity.Product;
import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.service.ProductService;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import java.util.ArrayList;
import java.util.List;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class ProductControllerTests {

    private static final String PRODUCT_NAME = "test";
    private static final Long PRODUCT_ID = 5L;
    private static final Long PRODUCT_CATEGORY_ID = 1L;
    private static final String PRODUCT_CATEGORY_NAME = "testCategory";
    private static final Long PRODUCT_BRAND_ID = 2L;
    private static final String PRODUCT_BRAND_NAME = "testBrand";
    private List<Product> products;
    private Product product;
    private Category category;
    private Brand brand;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

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
    public void  get_all_products_controller_should_return200_when_validRequest() throws Exception {
    	//when
    	when(productService.getAllProduct()).thenReturn(products);
//        given(productService.getAllProduct()).willReturn(products);

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$[0].id").value(PRODUCT_ID))
                .andExpect(jsonPath("$[0].productName").value(PRODUCT_NAME));

        verify(productService, Mockito.times(1)).getAllProduct();
        verifyNoMoreInteractions(productService);
    }
    
    @Test
    public void  get_all_products_controller_should_return404_when_productList_isEmpty() throws Exception {
    	//given
    	List<Product> products = new ArrayList<Product>();
    	
    	//when
    	when(productService.getAllProduct()).thenReturn(products);
    	
    	//then
    	mockMvc.perform(get("/products"))
        .andExpect(status().isNotFound())
        .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_UTF8));

    	verify(productService, Mockito.times(1)).getAllProduct();
    	verifyNoMoreInteractions(productService);
    }
    	
    	
    	
    @Test
    public void get_all_product_by_category_controller_should_return200_when_validRequest() throws Exception {
        //when
        when(productService.getAllProductByCategory(PRODUCT_CATEGORY_ID)).thenReturn(products);

        //then
        mockMvc.perform(get("/products").param("categoryId", PRODUCT_CATEGORY_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$[0].id").value(PRODUCT_ID))
                .andExpect(jsonPath("$[0].category.id").value(PRODUCT_CATEGORY_ID))
                .andExpect(jsonPath("$[0].category.name").value(PRODUCT_CATEGORY_NAME));

        verify(productService, times(1)).getAllProductByCategory(anyLong());
        verifyNoMoreInteractions(productService);
    }

    @Test
    public void get_all_product_by_category_controller_should_return404_when_productList_isEmpty() throws Exception {
    	//given
    	List<Product> products = new ArrayList<Product>();
    	
    	//when
    	when(productService.getAllProductsByName(PRODUCT_NAME)).thenReturn(products);
    	
        //then
        mockMvc.perform(get("/products").param("categoryId", PRODUCT_CATEGORY_ID.toString()))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_UTF8));

        verify(productService, times(1)).getAllProductByCategory(anyLong());
        verifyNoMoreInteractions(productService);
    }
    
    @Test
    public void get_one_product_by_id_controller_should_return200_when_validRequest() throws Exception {
    	//when
        when(productService.getProductById(anyLong())).thenReturn(product);
        
        //then
        mockMvc.perform(get("/products/{id}", PRODUCT_ID))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(PRODUCT_ID))
                .andExpect(jsonPath("$.productName").value(PRODUCT_NAME))
                .andExpect(jsonPath("$.category.id").value(PRODUCT_CATEGORY_ID))
                .andExpect(jsonPath("$.category.name").value(PRODUCT_CATEGORY_NAME));

        verify(productService, times(1)).getProductById(PRODUCT_ID);
        verifyNoMoreInteractions(productService);
    }
    
    @Test
    public void get_one_product_by_id_controller_should_return404_when_product_isNotExist() throws Exception {
    	//when
        when(productService.getProductById(anyLong())).thenReturn(null);
        
        //then
        mockMvc.perform(get("/products/{id}", PRODUCT_ID))
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_UTF8))
                .andExpect(status().isNotFound());

        verify(productService, times(1)).getProductById(PRODUCT_ID);
        verifyNoMoreInteractions(productService);
    }

    @Test
    public void get_all_product_by_brand_controller_should_return200_when_validRequest() throws Exception {
        //when
        when(productService.getAllProductByBrand(PRODUCT_BRAND_ID)).thenReturn(products);

        //then
        mockMvc.perform(get("/products").param("brandId", PRODUCT_BRAND_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8))
                .andExpect(jsonPath("$[0].id").value(PRODUCT_ID))
                .andExpect(jsonPath("$[0].brand.id").value(PRODUCT_BRAND_ID))
                .andExpect(jsonPath("$[0].brand.name").value(PRODUCT_BRAND_NAME));

        verify(productService, times(1)).getAllProductByBrand(anyLong());
        verifyNoMoreInteractions(productService);
    }
}

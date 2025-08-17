package com.nguyenquocviet.productcatalogservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nguyenquocviet.productcatalogservice.entity.Brand;
import com.nguyenquocviet.productcatalogservice.dto.BrandDTO;
import com.nguyenquocviet.productcatalogservice.service.BrandService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class AdminBrandControllerTest {
    private static final String BRAND_NAME = "testBrand";
    private static final Long BRAND_ID = 1L;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BrandService brandService;

    @Test
    public void add_brand_controller_should_return201_when_brand_isSaved() throws Exception {
        Brand brand = new Brand();
        brand.setId(BRAND_ID);
        brand.setName(BRAND_NAME);
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(brand);

        when(brandService.createBrand(any(BrandDTO.class))).thenReturn(brand);

        mockMvc.perform(post("/admin/brands").content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(BRAND_ID))
                .andExpect(jsonPath("$.name").value(BRAND_NAME));

        verify(brandService, times(1)).createBrand(any(BrandDTO.class));
        verifyNoMoreInteractions(brandService); // Đã chuyển sang BrandDTO
    }

    @Test
    public void add_brand_controller_should_return400_when_brand_isNull() throws Exception {
        Brand brand = null;
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(brand);

        mockMvc.perform(post("/admin/brands").content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void get_all_brands_controller_should_return200() throws Exception {
        Brand brand = new Brand();
        brand.setId(BRAND_ID);
        brand.setName(BRAND_NAME);
        java.util.List<Brand> brands = new java.util.ArrayList<>();
        brands.add(brand);
        when(brandService.getBrands()).thenReturn(brands);
        mockMvc.perform(get("/admin/brands"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(BRAND_ID))
                .andExpect(jsonPath("$[0].name").value(BRAND_NAME));
        verify(brandService, times(1)).getBrands();
        verifyNoMoreInteractions(brandService); // Đã chuyển sang BrandDTO
    }

    

    @Test
    public void get_brand_by_id_controller_should_return404_when_not_found() throws Exception {
        when(brandService.getBrandById(BRAND_ID)).thenReturn(null);
        mockMvc.perform(get("/admin/brands/" + BRAND_ID))
                .andExpect(status().isNotFound());
        verify(brandService, times(1)).getBrandById(BRAND_ID);
        verifyNoMoreInteractions(brandService); // Đã chuyển sang BrandDTO
    }

    @Test
    public void update_brand_controller_should_return200_when_updated() throws Exception {
        Brand brand = new Brand();
        brand.setId(BRAND_ID);
        brand.setName(BRAND_NAME);
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(brand);
        when(brandService.updateBrand(eq(BRAND_ID), any(BrandDTO.class))).thenReturn(brand);
        mockMvc.perform(put("/admin/brands/" + BRAND_ID).content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(BRAND_ID))
                .andExpect(jsonPath("$.name").value(BRAND_NAME));
        verify(brandService, times(1)).updateBrand(eq(BRAND_ID), any(BrandDTO.class));
        verifyNoMoreInteractions(brandService); // Đã chuyển sang BrandDTO
    }

    @Test
    public void update_brand_controller_should_return404_when_not_found() throws Exception {
        Brand brand = new Brand();
        brand.setId(BRAND_ID);
        brand.setName(BRAND_NAME);
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(brand);
        when(brandService.updateBrand(eq(BRAND_ID), any(BrandDTO.class))).thenReturn(null);
        mockMvc.perform(put("/admin/brands/" + BRAND_ID).content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
        verify(brandService, times(1)).updateBrand(eq(BRAND_ID), any(BrandDTO.class));
        verifyNoMoreInteractions(brandService); // Đã chuyển sang BrandDTO
    }

    @Test
    public void delete_brand_controller_should_return204_when_deleted() throws Exception {
        doNothing().when(brandService).deleteBrand(BRAND_ID);
        mockMvc.perform(delete("/admin/brands/" + BRAND_ID))
                .andExpect(status().isNoContent());
        verify(brandService, times(1)).deleteBrand(BRAND_ID);
        verifyNoMoreInteractions(brandService); // Đã chuyển sang BrandDTO
    }
}


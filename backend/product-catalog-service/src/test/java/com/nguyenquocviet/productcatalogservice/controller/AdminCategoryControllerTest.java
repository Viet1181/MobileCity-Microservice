package com.nguyenquocviet.productcatalogservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.dto.CategoryDTO;
import com.nguyenquocviet.productcatalogservice.service.CategoryService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class AdminCategoryControllerTest {
    private static final String CATEGORY_NAME = "testCategory";
    private static final Long CATEGORY_ID = 1L;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Test
    public void add_category_controller_should_return201_when_category_isSaved() throws Exception {
        Category category = new Category();
        category.setId(CATEGORY_ID);
        category.setName(CATEGORY_NAME);
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(category);

        when(categoryService.addCategory(any(CategoryDTO.class))).thenReturn(category);

        mockMvc.perform(post("/admin/categories").content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(CATEGORY_ID))
                .andExpect(jsonPath("$.name").value(CATEGORY_NAME));

        verify(categoryService, times(1)).addCategory(any(CategoryDTO.class));
        verifyNoMoreInteractions(categoryService); // Đã chuyển sang CategoryDTO
    }

    @Test
    public void add_category_controller_should_return400_when_category_isNull() throws Exception {
        Category category = null;
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(category);

        mockMvc.perform(post("/admin/categories").content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void get_all_categories_controller_should_return200() throws Exception {
        Category category = new Category();
        category.setId(CATEGORY_ID);
        category.setName(CATEGORY_NAME);
        List<Category> categories = new java.util.ArrayList<>();
        categories.add(category);
        when(categoryService.getAllCategories()).thenReturn(categories);
        mockMvc.perform(get("/admin/categories"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(CATEGORY_ID))
                .andExpect(jsonPath("$[0].name").value(CATEGORY_NAME));
        verify(categoryService, times(1)).getAllCategories();
        verifyNoMoreInteractions(categoryService); // Đã chuyển sang CategoryDTO
    }

    @Test
    public void get_category_by_id_controller_should_return200_when_found() throws Exception {
        Category category = new Category();
        category.setId(CATEGORY_ID);
        category.setName(CATEGORY_NAME);
        when(categoryService.getCategoryById(CATEGORY_ID)).thenReturn(category);
        mockMvc.perform(get("/admin/categories/" + CATEGORY_ID))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(CATEGORY_ID))
                .andExpect(jsonPath("$.name").value(CATEGORY_NAME));
        verify(categoryService, times(1)).getCategoryById(CATEGORY_ID);
        verifyNoMoreInteractions(categoryService); // Đã chuyển sang CategoryDTO
    }

    @Test
    public void get_category_by_id_controller_should_return404_when_not_found() throws Exception {
        when(categoryService.getCategoryById(CATEGORY_ID)).thenReturn(null);
        mockMvc.perform(get("/admin/categories/" + CATEGORY_ID))
                .andExpect(status().isNotFound());
        verify(categoryService, times(1)).getCategoryById(CATEGORY_ID);
        verifyNoMoreInteractions(categoryService); // Đã chuyển sang CategoryDTO
    }

    @Test
    public void update_category_controller_should_return200_when_updated() throws Exception {
        Category category = new Category();
        category.setId(CATEGORY_ID);
        category.setName(CATEGORY_NAME);
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(category);
        when(categoryService.updateCategory(eq(CATEGORY_ID), any(CategoryDTO.class))).thenReturn(category);
        mockMvc.perform(put("/admin/categories/" + CATEGORY_ID).content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(CATEGORY_ID))
                .andExpect(jsonPath("$.name").value(CATEGORY_NAME));
        verify(categoryService, times(1)).updateCategory(eq(CATEGORY_ID), any(CategoryDTO.class));
        verifyNoMoreInteractions(categoryService); // Đã chuyển sang CategoryDTO
    }

    @Test
    public void update_category_controller_should_return404_when_not_found() throws Exception {
        Category category = new Category();
        category.setId(CATEGORY_ID);
        category.setName(CATEGORY_NAME);
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(SerializationFeature.WRAP_ROOT_VALUE, false);
        ObjectWriter objectWriter = mapper.writer().withDefaultPrettyPrinter();
        String requestJson = objectWriter.writeValueAsString(category);
        when(categoryService.updateCategory(eq(CATEGORY_ID), any(CategoryDTO.class))).thenReturn(null);
        mockMvc.perform(put("/admin/categories/" + CATEGORY_ID).content(requestJson).contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound()); // vẫn trả về đúng 404 cho DTO
        verify(categoryService, times(1)).updateCategory(eq(CATEGORY_ID), any(CategoryDTO.class));
        verifyNoMoreInteractions(categoryService); // Đã chuyển sang CategoryDTO
    }

    @Test
    public void delete_category_controller_should_return204_when_deleted() throws Exception {
        doNothing().when(categoryService).deleteCategory(CATEGORY_ID);
        mockMvc.perform(delete("/admin/categories/" + CATEGORY_ID))
                .andExpect(status().isNoContent());
        verify(categoryService, times(1)).deleteCategory(CATEGORY_ID);
        verifyNoMoreInteractions(categoryService); // Đã chuyển sang CategoryDTO
    }
}


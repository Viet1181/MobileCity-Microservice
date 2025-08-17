package com.nguyenquocviet.productcatalogservice.controller;

import com.nguyenquocviet.productcatalogservice.entity.Category;
import com.nguyenquocviet.productcatalogservice.service.CategoryService;
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
public class CategoryControllerTests {
    private static final Long CATEGORY_ID = 1L;
    private static final String CATEGORY_NAME = "testCategory";
    private List<Category> categories;
    private Category category;
    @Mock
    private CategoryService categoryService;
    @InjectMocks
    private CategoryController categoryController;
    @Before
    public void setUp() {
        category = new Category();
        category.setId(CATEGORY_ID);
        category.setName(CATEGORY_NAME);
        categories = new ArrayList<>();
        categories.add(category);
    }
    @Test
    public void get_all_categories_test() {
        Mockito.when(categoryService.getAllCategories()).thenReturn(categories);
        java.util.List<com.nguyenquocviet.productcatalogservice.dto.CategoryDTO> found = categoryController.getAllCategories();
        assertNotNull(found);
        assertEquals(found.size(), 1);
        assertEquals(found.get(0).getName(), CATEGORY_NAME);
        assertEquals(found.get(0).getId(), CATEGORY_ID);
        Mockito.verify(categoryService, Mockito.times(1)).getAllCategories();
        Mockito.verifyNoMoreInteractions(categoryService);
    }
}

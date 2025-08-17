package com.nguyenquocviet.orderservice.controller;

import com.nguyenquocviet.orderservice.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/items")
public class ItemController {
    @Autowired
    private ItemRepository itemRepository;

    @GetMapping("/exists-by-product/{productId}")
    public boolean existsByProductId(@PathVariable Long productId) {
        return itemRepository.existsByProductId(productId);
    }
}

package com.nguyenquocviet.productcatalogservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "order-service")
public interface OrderItemClient {
    @GetMapping("/internal/items/exists-by-product/{productId}")
    boolean existsByProductId(@PathVariable("productId") Long productId);
}

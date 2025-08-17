package com.nguyenquocviet.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.nguyenquocviet.orderservice.domain.Product;
import java.util.List;

@FeignClient(name = "product-catalog-service")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    public Product getProductById(@PathVariable(value = "id") Long productId);

    @PutMapping("/products/{id}/availability")
    Product updateAvailability(@PathVariable("id") Long id, @RequestParam("availability") Integer availability);

    @GetMapping(value = "/products", params = "name")
    List<Product> getAllProductsByName(@RequestParam("name") String name);
}

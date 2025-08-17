package com.nguyenquocviet.orderservice.service;

import com.nguyenquocviet.orderservice.domain.Order;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;

public interface OrderService {
    public Order saveOrder(Order order);
    public List<Order> findAllOrders();
    public Optional<Order> findById(Long id);
    Page<Order> findAllOrders(Pageable pageable);
}

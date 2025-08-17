package com.nguyenquocviet.orderservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.orm.jpa.EntityManagerFactoryUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nguyenquocviet.orderservice.domain.Item;
import com.nguyenquocviet.orderservice.domain.Order;
import com.nguyenquocviet.orderservice.domain.Product;
import com.nguyenquocviet.orderservice.repository.OrderRepository;
import com.nguyenquocviet.orderservice.feignclient.ProductClient;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private ProductClient productClient;

    @Override
    @Transactional
    public Order saveOrder(Order order) {
        System.out.println("Saving order: " + order);
        // Kiểm tra tồn kho và trừ tồn kho từng sản phẩm
        if (order.getItems() != null) {
            List<Item> managedItems = new java.util.ArrayList<>();
            for (Item item : order.getItems()) {
                if (item.getProduct() != null) {
                    // Tìm sản phẩm thật theo tên (microservice: id có thể khác DB)
                    List<Product> productsByName = productClient.getAllProductsByName(item.getProduct().getProductName());
                    if (productsByName == null || productsByName.isEmpty()) {
                        throw new RuntimeException("Không tìm thấy sản phẩm với tên: " + item.getProduct().getProductName());
                    }
                    Product realProduct = productsByName.get(0); // Ưu tiên lấy sản phẩm đầu tiên
                    if (item.getQuantity() > realProduct.getAvailability()) {
                        throw new RuntimeException("Sản phẩm '" + realProduct.getProductName() + "' chỉ còn " + realProduct.getAvailability() + " sản phẩm trong kho. Không đủ số lượng để đặt hàng!");
                    }
                    // Gọi API trừ tồn kho bằng id thật
                    int newAvailability = realProduct.getAvailability() - item.getQuantity();
                    productClient.updateAvailability(realProduct.getId(), newAvailability);
                    // Cập nhật lại product vào item (nếu cần)
                    Product managedProduct = entityManager.merge(item.getProduct());
                    item.setProduct(managedProduct);
                }
                // Lưu item
                Item managedItem = entityManager.merge(item);
                managedItems.add(managedItem);
            }
            order.setItems(managedItems);
        }
        return orderRepository.save(order);
    }

    @Override
    public List<Order> findAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }
    @Override
public Page<Order> findAllOrders(Pageable pageable) {
    return orderRepository.findAll(pageable);
}

}

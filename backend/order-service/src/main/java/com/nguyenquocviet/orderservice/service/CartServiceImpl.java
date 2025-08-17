package com.nguyenquocviet.orderservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import com.nguyenquocviet.orderservice.domain.Item;
import com.nguyenquocviet.orderservice.domain.Product;
import com.nguyenquocviet.orderservice.feignclient.ProductClient;
import com.nguyenquocviet.orderservice.redis.CartRedisRepository;
import com.nguyenquocviet.orderservice.utilities.CartUtilities;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private ProductClient productClient;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    @Override
    public void addItemToCart(String cartId, Long productId, Integer quantity) {
        try {
            System.out.println("=== CartService.addItemToCart - Start ===");
            System.out.println("Fetching product with ID: " + productId);

            Product product = productClient.getProductById(productId);
            if (product == null) {
                System.err.println("Product not found with ID: " + productId);
                throw new RuntimeException("Product not found with ID: " + productId);
            }

            System.out.println("Retrieved product: " + product);

            // Đọc toàn bộ cart hiện tại
            List<Object> existingCart = getCart(cartId);
            System.out.println("Current cart items: " + existingCart);

            int totalQuantity = quantity;
            // Xóa tất cả các item có cùng productId, đồng thời cộng dồn số lượng
            for (Object obj : existingCart) {
                if (obj instanceof Item) {
                    Item existingItem = (Item) obj;
                    if (existingItem.getProduct().getId().equals(productId)) {
                        totalQuantity += existingItem.getQuantity();
                        // Xóa đúng instance lấy từ Redis
                        cartRedisRepository.deleteItemFromCart(cartId, existingItem);
                    }
                }
            }

            // Tạo Product mới để lưu vào cart (tránh lỗi tham chiếu)
            Product productToSave = new Product();
            productToSave.setId(product.getId());
            productToSave.setProductName(product.getProductName());
            productToSave.setPrice(product.getPrice());
            productToSave.setImageUrl(product.getImageUrl());

            Item newItem = new Item(totalQuantity, productToSave, CartUtilities.getSubTotalForItem(product, totalQuantity));
            cartRedisRepository.addItemToCart(cartId, newItem);
            System.out.println("Added/Updated item successfully");
        } catch (Exception e) {
            System.err.println("=== Error in CartService.addItemToCart ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            System.err.println("Stack trace:");
            e.printStackTrace();
            System.err.println("=== End error details ===");
            throw e;
        }
    }

    @Override
    public List<Object> getCart(String cartId) {
        try {
            Collection<Object> cartItems = cartRedisRepository.getCart(cartId, Item.class);
            System.out.println("Retrieved cart items: " + cartItems);
            return new ArrayList<>(cartItems);
        } catch (Exception e) {
            System.err.println("Error getting cart: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity) {
        try {
            List<Object> cart = getCart(cartId);
            for (Object obj : cart) {
                if (obj instanceof Item) {
                    Item item = (Item) obj;
                    if (item.getProduct().getId().equals(productId)) {
                        cartRedisRepository.deleteItemFromCart(cartId, item);
                        item.setQuantity(quantity);
                        item.setSubTotal(CartUtilities.getSubTotalForItem(item.getProduct(), quantity));
                        cartRedisRepository.addItemToCart(cartId, item);
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error changing item quantity: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error changing item quantity", e);
        }
    }
    @Override
    public void updateItemQuantity(String cartId, Long productId, Integer quantity) {
        changeItemQuantity(cartId, productId, quantity);
    }
    @Override
    public void deleteItemFromCart(String cartId, Long productId) {
        try {
            List<Object> cart = getCart(cartId);
            for (Object obj : cart) {
                if (obj instanceof Item) {
                    Item item = (Item) obj;
                    if (item.getProduct().getId().equals(productId)) {
                        cartRedisRepository.deleteItemFromCart(cartId, item);
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error deleting item from cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error deleting item from cart", e);
        }
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId) {
        try {
            List<Object> cart = getCart(cartId);
            for (Object obj : cart) {
                if (obj instanceof Item) {
                    Item item = (Item) obj;
                    if (item.getProduct().getId().equals(productId)) {
                        return true;
                    }
                }
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error checking if item exists: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public List<Item> getAllItemsFromCart(String cartId) {
        try {
            Collection<Object> cartItems = cartRedisRepository.getCart(cartId, Item.class);
            List<Item> items = new ArrayList<>();
            for (Object obj : cartItems) {
                if (obj instanceof Item) {
                    items.add((Item) obj);
                }
            }
            return items;
        } catch (Exception e) {
            System.err.println("Error getting all items from cart: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    @Override
    public void deleteCart(String cartId) {
        try {
            cartRedisRepository.deleteCart(cartId);
        } catch (Exception e) {
            System.err.println("Error deleting cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error deleting cart", e);
        }
    }

    @Override
    public void clearCart(String cartId) {
        try {
            cartRedisRepository.deleteCart(cartId);
        } catch (Exception e) {
            System.err.println("Error clearing cart: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error clearing cart", e);
        }
    }
}

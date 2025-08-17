package com.nguyenquocviet.productcatalogservice.listener;

import com.nguyenquocviet.productcatalogservice.event.ProductImageDeleteEvent;
import com.nguyenquocviet.productcatalogservice.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.stereotype.Component;


@Component
public class ProductImageDeleteListener {
    @Autowired
    private ImageService imageService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleProductImageDelete(ProductImageDeleteEvent event) {
        try {
            imageService.deleteImage(event.getImageUrl());
        } catch (Exception e) {
            // Có thể log lỗi nếu cần
        }
    }
}

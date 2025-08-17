package com.nguyenquocviet.productcatalogservice.event;

public class ProductImageDeleteEvent {
    private final String imageUrl;
    public ProductImageDeleteEvent(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    public String getImageUrl() {
        return imageUrl;
    }
}

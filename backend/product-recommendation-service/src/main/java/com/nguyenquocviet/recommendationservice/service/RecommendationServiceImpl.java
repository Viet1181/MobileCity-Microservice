package com.nguyenquocviet.recommendationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nguyenquocviet.recommendationservice.model.Recommendation;
import com.nguyenquocviet.recommendationservice.repository.RecommendationRepository;

import java.util.List;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Override
    public Recommendation saveRecommendation(Recommendation recommendation) {
        // Khi lưu mới hoặc cập nhật, vẫn lưu mọi trạng thái (active true/false)
        return recommendationRepository.save(recommendation);
    }

    @Override
    public List<Recommendation> getAllRecommendationByProductName(String productName) {
        // Chỉ lấy các review đang hoạt động (active=true)
        return recommendationRepository.findAllRatingByProductName(productName);
    }

    @Override
    public Recommendation updateRecommendation(Long id, int rating, String comment) {
        Recommendation rec = recommendationRepository.findById(id).orElse(null);
        if (rec != null) {
            rec.setRating(rating);
            rec.setComment(comment);
            // Có thể kiểm tra active=true nếu muốn chỉ cho update review còn hiệu lực
            return recommendationRepository.save(rec);
        }
        return null;
    }

    @Override
    public List<Recommendation> getAllRecommendation() {
        // TODO: Nếu cần, chỉ lấy review active=true cho toàn hệ thống
        return recommendationRepository.findAll();
    }

    @Override
    public void deleteRecommendation(Long id) {
        // Đã chuyển sang ẩn review thay vì xóa vật lý ở controller
        // Hàm này giữ lại cho tương thích, nhưng không nên gọi trực tiếp để xóa vật lý nữa
        recommendationRepository.deleteById(id);
    }

    @Override
    public Recommendation getRecommendationById(Long recommendationId) {
        // Nếu muốn chỉ lấy review active=true thì cần custom lại repository
        return recommendationRepository.findById(recommendationId).orElse(null);
    }
    
}

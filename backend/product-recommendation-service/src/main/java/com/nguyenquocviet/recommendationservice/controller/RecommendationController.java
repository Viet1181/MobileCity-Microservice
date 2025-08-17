package com.nguyenquocviet.recommendationservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nguyenquocviet.recommendationservice.feignClient.ProductClient;
import com.nguyenquocviet.recommendationservice.feignClient.UserClient;
import com.nguyenquocviet.recommendationservice.http.header.HeaderGenerator;
import com.nguyenquocviet.recommendationservice.model.Product;
import com.nguyenquocviet.recommendationservice.model.Recommendation;
import com.nguyenquocviet.recommendationservice.model.User;
import com.nguyenquocviet.recommendationservice.service.RecommendationService;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class RecommendationController {

 

    @GetMapping("/recommendations/all")
    public ResponseEntity<List<Recommendation>> getAllRecommendations() {
        List<Recommendation> recommendations = recommendationService.getAllRecommendation();
        return new ResponseEntity<>(recommendations, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private UserClient userClient;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/recommendations")
    private ResponseEntity<List<Recommendation>> getAllRating(@RequestParam("name") String productName){
        List<Recommendation> recommendations = recommendationService.getAllRecommendationByProductName(productName);
        return new ResponseEntity<List<Recommendation>>(
            recommendations,
            headerGenerator.getHeadersForSuccessGetMethod(),
            HttpStatus.OK);
    }
    @GetMapping("/recommendations/{id}")
public ResponseEntity<Recommendation> getRecommendationById(@PathVariable("id") Long id) {
    Recommendation recommendation = recommendationService.getRecommendationById(id);
    if (recommendation != null) {
        return new ResponseEntity<>(recommendation, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    } else {
        return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }
}
    @PostMapping(value = "/{userId}/recommendations/{productId}")
    private ResponseEntity<Recommendation> saveRecommendations(
            @PathVariable ("userId") Long userId,
            @PathVariable ("productId") Long productId,
            @RequestParam ("rating") int rating,
            @RequestParam(value = "comment", required = false) String comment,
            HttpServletRequest request){
    	
    	Product product = productClient.getProductById(productId);
		User user = userClient.getUserById(userId);
    	
		if(product != null && user != null) {
			try {
				Recommendation recommendation = new Recommendation();
				recommendation.setProduct(product);
				recommendation.setUser(user);
				recommendation.setRating(rating);
				recommendation.setComment(comment);
				// Set trạng thái nếu có param
				if (request.getParameter("status") != null) {
				    recommendation.setStatus(request.getParameter("status"));
				}
				recommendationService.saveRecommendation(recommendation);
				return new ResponseEntity<Recommendation>(
						recommendation,
						headerGenerator.getHeadersForSuccessPostMethod(request, recommendation.getId()),
						HttpStatus.CREATED);
			}catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<Recommendation>(
						headerGenerator.getHeadersForError(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
        return new ResponseEntity<Recommendation>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/recommendations/{id}")
    public ResponseEntity<Recommendation> updateRecommendation(
            @PathVariable("id") Long id,
            @RequestBody Recommendation updateRequest,
            HttpServletRequest request) {
        Recommendation recommendation = recommendationService.getRecommendationById(id);
        if (recommendation != null) {
            try {
                if (updateRequest.getRating() != 0)
                    recommendation.setRating(updateRequest.getRating());
                if (updateRequest.getComment() != null)
                    recommendation.setComment(updateRequest.getComment());
                if (updateRequest.getStatus() != null)
                    recommendation.setStatus(updateRequest.getStatus());
                recommendationService.saveRecommendation(recommendation);
                return new ResponseEntity<>(
                    recommendation,
                    headerGenerator.getHeadersForSuccessPostMethod(request, recommendation.getId()),
                    HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<>(
            headerGenerator.getHeadersForError(),
            HttpStatus.NOT_FOUND);
    }

    @DeleteMapping(value = "/recommendations/{id}")
    private ResponseEntity<Void> deleteRecommendations(@PathVariable("id") Long id){
        Recommendation recommendation = recommendationService.getRecommendationById(id);
        if(recommendation != null) {
            try {
                // Thay vì xóa vật lý, chuyển trạng thái ẩn
                recommendation.setStatus("hidden");
                recommendationService.saveRecommendation(recommendation);
                return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
            }catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<Void>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);    
            }
        }
        return new ResponseEntity<Void>(
            headerGenerator.getHeadersForError(),
            HttpStatus.NOT_FOUND);
    }
}


package com.nguyenquocviet.userservice.config;

import com.nguyenquocviet.userservice.entity.User;
import com.nguyenquocviet.userservice.entity.UserDetails;
import com.nguyenquocviet.userservice.entity.UserRole;
import com.nguyenquocviet.userservice.repository.UserRepository;
import com.nguyenquocviet.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Tạo các role nếu chưa tồn tại
        UserRole adminRole = userRoleRepository.findByRoleName("ROLE_ADMIN")
                .orElseGet(() -> {
                    UserRole role = new UserRole();
                    role.setRoleName("ROLE_ADMIN");
                    return userRoleRepository.save(role);
                });

        UserRole userRole = userRoleRepository.findByRoleName("ROLE_USER")
                .orElseGet(() -> {
                    UserRole role = new UserRole();
                    role.setRoleName("ROLE_USER");
                    return userRoleRepository.save(role);
                });

        // Tạo tài khoản admin nếu chưa tồn tại
        if (!userRepository.existsByUserName("admin")) {
            User admin = new User();
            admin.setUserName("admin");
            admin.setUserPassword(passwordEncoder.encode("12345"));
            admin.setActive(1);
            admin.setRole(adminRole);  

            UserDetails adminDetails = new UserDetails();
            adminDetails.setFirstName("John");
            adminDetails.setLastName("Doe");
            adminDetails.setEmail("admin@gmail.com");
            adminDetails.setPhoneNumber("1234567890");
            adminDetails.setStreet("Main St");
            adminDetails.setStreetNumber("123");
            adminDetails.setZipCode("123456");
            adminDetails.setLocality("Hometown");
            adminDetails.setCountry("Country");
            
            admin.setUserDetails(adminDetails);
            adminDetails.setUser(admin);
            
            userRepository.save(admin);
        }
    }
}

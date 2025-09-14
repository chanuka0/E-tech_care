//package com.example.demo.laptopBrand;
//
////import com.example.demo.entities.LaptopBrand;
////import com.example.demo.repositories.LaptopBrandRepository;
//import com.example.demo.users.User;
//import com.example.demo.users.UserRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.log4j.Log4j2;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Component;
//
//import java.time.LocalDateTime;
//import java.util.Arrays;
//import java.util.List;
//
//@Log4j2
//@Component
//@RequiredArgsConstructor
//public class DataInitializer implements CommandLineRunner {
//
//
//    private final UserRepository userRepository;
//    private final LaptopBrandRepository laptopBrandRepository;
//    private final PasswordEncoder passwordEncoder;
//
//    @Override
//    public void run(String... args) {
//        initializeDefaultAdmin();
//        initializeLaptopBrands();
//    }
//
//    private void initializeDefaultAdmin() {
//        if (userRepository.findByUsername("admin").isEmpty()) {
//            User admin = new User();
//            admin.setUserName("admin");
//            admin.setEmail("admin@repairshop.com");
//            admin.setPassword(passwordEncoder.encode("admin123"));
//            admin.addRole("ROLE_ADMIN");
//            userRepository.save(admin);
//            log.info("Default admin user created: admin/admin123");
//        }
//    }
//
//    private void initializeLaptopBrands() {
//        if (laptopBrandRepository.count() == 0) {
//            List<String> brandNames = Arrays.asList(
//                    "Dell", "HP", "Lenovo", "Asus", "Acer", "MSI",
//                    "Apple", "Samsung", "Toshiba", "Sony", "Fujitsu", "Other"
//            );
//
//            for (String brandName : brandNames) {
//                LaptopBrand brand = new LaptopBrand();
//                brand.setBrandName(brandName);
//                brand.setDescription(brandName + " laptops");
//                brand.setCreatedDate(LocalDateTime.now());
//                brand.setUpdatedDate(LocalDateTime.now());
//                laptopBrandRepository.save(brand);
//            }
//
//            log.info("Default laptop brands initialized");
//        }
//    }
//}
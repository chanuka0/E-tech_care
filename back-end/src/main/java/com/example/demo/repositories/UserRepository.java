//package com.example.demo.repositories;
//
////package com.etechcare.repository;
//
////import com.etechcare.entity.User;
//import com.example.demo.users.User;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import java.util.Optional;
//
//@Repository
//public interface UserRepository extends JpaRepository<User, Long> {
//    Optional<User> findByUsername(String username);
//    Optional<User> findByEmail(String email);
//    Boolean existsByUsername(String username);
//    Boolean existsByEmail(String email);
//}
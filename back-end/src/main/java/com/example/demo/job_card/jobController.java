package com.example.demo.job_card;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
public class Controller {

    public class UserController {

        @Autowired
        private jobservice userService;

        @GetMapping
        public String test() {
            return "User API working!";
        }
}

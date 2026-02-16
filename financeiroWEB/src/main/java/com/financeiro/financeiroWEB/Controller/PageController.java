package com.financeiro.financeiroWEB.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String index(){
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }

    @GetMapping("/register")
    public String register(){
        return "auth/register";
    }

    @GetMapping("/app")
    public String app(){
        return "app/dashboard";
    }
    
}

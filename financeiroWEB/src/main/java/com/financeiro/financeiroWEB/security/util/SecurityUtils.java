package com.financeiro.financeiroWEB.security.util;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    private SecurityUtils(){

    }

    public static String getAuthenticatedEmail(){
        Authentication auth = SecurityContextHolder
                      .getContext()
                      .getAuthentication();
        
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("Usuário não autenticado");


    }

    return auth.getName();
    
    }
}

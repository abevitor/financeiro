package com.financeiro.financeiroWEB.auth;

import com.financeiro.financeiroWEB.auth.dto.*;
import com.financeiro.financeiroWEB.auth.jwt.JwtService;

import io.jsonwebtoken.Jwts;
import jakarta.validation.Valid;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest req){
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.senha())
        );

        String token = jwtService.generateToken(req.email());

        return new LoginResponse(token, "Bearer", jwtService.getExpiresInSeconds());
    }

}

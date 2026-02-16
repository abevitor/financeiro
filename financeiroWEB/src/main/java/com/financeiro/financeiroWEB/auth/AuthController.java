package com.financeiro.financeiroWEB.auth;

import com.financeiro.financeiroWEB.auth.dto.LoginRequest;
import com.financeiro.financeiroWEB.auth.dto.LoginResponse;
import com.financeiro.financeiroWEB.auth.jwt.JwtService;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
    public LoginResponse login(@RequestBody @Valid LoginRequest req) {

        // autentica (se der errado, o Spring Security lança exception)
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.senha())
        );

        // token com base no email (subject)
        String token = jwtService.generateToken(auth.getName());

        return new LoginResponse(token, "Bearer", jwtService.getExpiresInSeconds());
    }
}

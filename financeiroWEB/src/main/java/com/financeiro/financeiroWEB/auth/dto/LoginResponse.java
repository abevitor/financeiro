package com.financeiro.financeiroWEB.auth.dto;

public record LoginResponse(
    String token,
    String tokenType,
    long expiresInSeconds
) {}

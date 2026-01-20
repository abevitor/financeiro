package com.financeiro.financeiroWEB.dto;

import com.financeiro.financeiroWEB.domain.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CategoryCreateRequest(

    @NotBlank String nome,
    @NotNull CategoryType tipo
    
) {
    
}

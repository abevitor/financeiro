package com.financeiro.financeiroWEB.dto;


import com.financeiro.financeiroWEB.domain.enums.CategoryType;


public record CategoryResponse (
    Long id,
    String nome,
    CategoryType tipo
) {
    
}

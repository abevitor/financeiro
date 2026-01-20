package com.financeiro.financeiroWEB.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.financeiro.financeiroWEB.domain.enums.TransactionType;

public record TransactionResponse(

    Long id,
    String descricao,
    BigDecimal valor, 
    LocalDate data,
    TransactionType tipo,
    Long userId,
    Long categoryId
) {}

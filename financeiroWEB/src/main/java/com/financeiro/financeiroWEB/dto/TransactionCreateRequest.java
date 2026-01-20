package com.financeiro.financeiroWEB.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.financeiro.financeiroWEB.domain.enums.TransactionType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TransactionCreateRequest(

    @NotBlank String descricao,
    @NotNull @Positive BigDecimal valor,
    @NotNull LocalDate data,
    @NotNull TransactionType tipo,
    @NotNull Long userId,
    @NotNull Long categoryId
) {}

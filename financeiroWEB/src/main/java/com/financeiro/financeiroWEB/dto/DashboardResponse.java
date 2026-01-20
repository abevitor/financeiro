package com.financeiro.financeiroWEB.dto;

import java.math.BigDecimal;

public record DashboardResponse(

    BigDecimal receitas,
    BigDecimal despesas,
    BigDecimal saldo
) {}

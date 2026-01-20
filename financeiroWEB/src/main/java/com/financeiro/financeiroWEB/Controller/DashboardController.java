package com.financeiro.financeiroWEB.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.financeiro.financeiroWEB.dto.DashboardResponse;
import com.financeiro.financeiroWEB.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{userId}")
    public ResponseEntity<DashboardResponse> resumo(@PathVariable Long userId) {
        return ResponseEntity.ok(dashboardService.resumo(userId));
    }
    
}

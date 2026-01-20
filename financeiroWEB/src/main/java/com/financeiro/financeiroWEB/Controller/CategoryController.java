package com.financeiro.financeiroWEB.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.financeiro.financeiroWEB.domain.enums.CategoryType;
import com.financeiro.financeiroWEB.dto.CategoryCreateRequest;
import com.financeiro.financeiroWEB.dto.CategoryResponse;
import com.financeiro.financeiroWEB.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> criar(@Valid @RequestBody CategoryCreateRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.criar(dto));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> listarTodas() {
        return ResponseEntity.ok(categoryService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.buscarPorId(id));
    }

    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<CategoryResponse>> listarPorTipo(@PathVariable CategoryType tipo) {
        return ResponseEntity.ok(categoryService.listarPorTipo(tipo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        categoryService.deletar(id);
        return ResponseEntity.noContent().build();
    }
    
}

package com.financeiro.financeiroWEB.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.financeiro.financeiroWEB.domain.enums.CategoryType;
import com.financeiro.financeiroWEB.domain.model.Category;
import com.financeiro.financeiroWEB.dto.CategoryCreateRequest;
import com.financeiro.financeiroWEB.dto.CategoryResponse;
import com.financeiro.financeiroWEB.exception.ResourceNotFoundException;
import com.financeiro.financeiroWEB.mapper.CategoryMapper;
import com.financeiro.financeiroWEB.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponse criar(CategoryCreateRequest dto) {
        Category salvo = categoryRepository.save(CategoryMapper.toEntity(dto));
        return CategoryMapper.toResponse(salvo);
    }

    public CategoryResponse buscarPorId(Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
        return CategoryMapper.toResponse(cat);
    }

    public List<CategoryResponse> listarTodas() {
        return categoryRepository.findAll().stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    public List<CategoryResponse> listarPorTipo(CategoryType tipo) {
        return categoryRepository.findByTipo(tipo).stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    public void deletar(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoria não encontrada");
        }
        categoryRepository.deleteById(id);
    }
}

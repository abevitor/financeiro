package com.financeiro.financeiroWEB.mapper;

import com.financeiro.financeiroWEB.domain.model.Category;
import com.financeiro.financeiroWEB.dto.CategoryCreateRequest;
import com.financeiro.financeiroWEB.dto.CategoryResponse;

public class CategoryMapper {

    private CategoryMapper(){}

    public static Category toEntity(CategoryCreateRequest dto){
        Category c = new Category();
        c.setNome(dto.nome());
        c.setTipo(dto.tipo());
        return c;
    }

    public static CategoryResponse toResponse(Category c){
        return new CategoryResponse(c.getId(), c.getNome(), c.getTipo());
    }
    
}

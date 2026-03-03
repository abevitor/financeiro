💰 FinanceiroWEB

Sistema full stack de controle financeiro pessoal desenvolvido com Java + Spring Boot, focado em arquitetura limpa, segurança com JWT e visualização inteligente de dados.

O objetivo do projeto foi construir uma aplicação real aplicando boas práticas de backend, organização em camadas, autenticação stateless e integração dinâmica com frontend responsivo.

✨ Visão Geral

O FinanceiroWEB permite que o usuário gerencie sua vida financeira de forma simples e segura, organizando receitas e despesas por categorias e visualizando os resultados em um dashboard interativo.

A aplicação oferece:

Cadastro e autenticação segura com JWT

Gerenciamento completo de receitas e despesas

Organização por categorias (RECEITA e DESPESA)

Cálculo automático de saldo

Filtro de transações por período

Paginação de resultados

Dashboard com gráficos dinâmicos

Interface moderna e responsiva

🔐 Segurança e Arquitetura

O sistema foi estruturado seguindo uma arquitetura em camadas bem definida:

Controller → Exposição dos endpoints REST

Service → Regras de negócio

Repository → Persistência com JPA

DTO + Mapper → Separação entre domínio e transporte de dados

Security → Autenticação e autorização com JWT

A autenticação é feita utilizando:

Spring Security configurado como stateless

Filtro customizado de validação de token

Geração e validação de JWT

Proteção de rotas autenticadas

Validação de ownership (o usuário acessa apenas suas próprias transações)

📊 Dashboard Inteligente

O dashboard foi desenvolvido para fornecer visão clara e rápida da situação financeira do usuário.

Ele apresenta:

Total de receitas

Total de despesas

Saldo atualizado automaticamente

Gráfico de evolução (linha):

Receitas por dia

Despesas por dia

Saldo acumulado

Gráfico de distribuição por categoria (doughnut)

Os gráficos são dinâmicos e respeitam filtros aplicados por período.

🛠️ Tecnologias Utilizadas
Backend

Java 17+

Spring Boot

Spring Security

JWT (JJWT)

Spring Data JPA

Hibernate

MySQL

Lombok

Bean Validation

Frontend

HTML5

TailwindCSS

JavaScript (Vanilla)

Chart.js

Ferramentas

Maven

Swagger / OpenAPI

Git

🚀 Como Executar o Projeto

Clone o repositório:

git clone https://github.com/seu-usuario/financeiroWEB.git
cd financeiroWEB

Configure o banco de dados no application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/financeiro
spring.datasource.username=root
spring.datasource.password=sua_senha

spring.jpa.hibernate.ddl-auto=update

Execute a aplicação:

mvn spring-boot:run

Acesse:

http://localhost:8080

Documentação Swagger:

http://localhost:8080/swagger-ui/index.html
🎯 Objetivo do Projeto

Este projeto foi desenvolvido com foco em:

Aplicação prática de arquitetura em camadas

Segurança com autenticação baseada em token

Boas práticas REST

Integração eficiente entre backend e frontend

Visualização de dados financeiros de forma clara

Construção de um sistema completo do zero

👨‍💻 Autor

Vitor Abe Prates
Desenvolvedor Backend | Java & Spring Boot

.

💰 FinanceiroWEB

Sistema completo de controle financeiro pessoal desenvolvido com Java + Spring Boot, utilizando autenticação JWT, arquitetura em camadas e dashboard com gráficos interativos.

📌 Sobre o Projeto

O FinanceiroWEB é uma aplicação full stack que permite ao usuário:

Gerenciar receitas e despesas

Organizar transações por categorias

Visualizar saldo atualizado automaticamente

Filtrar transações por período

Acompanhar dados em gráficos dinâmicos

Utilizar autenticação segura com JWT

O foco do projeto foi aplicar boas práticas de arquitetura, segurança e organização de código.

🚀 Funcionalidades
🔐 Autenticação

Cadastro de usuário

Login com geração de JWT

Proteção de rotas com Spring Security

Validação de ownership (usuário acessa apenas seus dados)

💳 Transações

Criar, editar e excluir transações

Tipos: RECEITA e DESPESA

Associação com categorias

Paginação

Filtro por período

🗂️ Categorias

Criar categorias de Receita ou Despesa

Listagem e exclusão

Integração automática com transações

📊 Dashboard

Total de receitas

Total de despesas

Saldo atual

Gráfico de evolução (linha):

Receitas por dia

Despesas por dia

Saldo acumulado

Gráfico de distribuição por categoria (doughnut)

📱 Interface

Layout responsivo com TailwindCSS

Sem frameworks JS pesados (Vanilla JS)

Experiência fluida e moderna

🏗️ Arquitetura

O projeto segue uma estrutura organizada em camadas:

controller/
service/
repository/
dto/
mapper/
security/
Separação clara entre:

Entidades (Model)

DTOs (Request/Response)

Regras de negócio (Service)

Persistência (Repository)

Segurança (JWT + Filter)

Frontend estático

🔐 Segurança

Spring Security configurado como stateless

Filtro customizado (JwtAuthenticationFilter)

Autenticação baseada em JWT

Senhas criptografadas

Tratamento de exceções personalizado

Proteção de endpoints com .authenticated()

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

📂 Estrutura do Projeto
financeiroWEB
 ├── controller
 ├── service
 ├── repository
 ├── domain
 │    ├── model
 │    └── enums
 ├── dto
 ├── mapper
 ├── security
 └── resources
      ├── static
      └── application.properties
⚙️ Como Executar o Projeto
1️⃣ Clonar o repositório
git clone https://github.com/seu-usuario/financeiroWEB.git
cd financeiroWEB
2️⃣ Configurar o banco de dados

No application.properties:

spring.datasource.url=jdbc:mysql://localhost:3306/financeiro
spring.datasource.username=root
spring.datasource.password=sua_senha

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
3️⃣ Executar a aplicação
mvn spring-boot:run

Ou rodar pela sua IDE.

4️⃣ Acessar

Aplicação:

http://localhost:8080

Swagger:

http://localhost:8080/swagger-ui/index.html
📈 Melhorias Futuras

Refresh Token

Exportação para PDF/Excel

Deploy em nuvem (AWS)

Relatórios mensais automáticos

Gráficos comparativos por mês

Cache para otimização

🎯 Objetivo do Projeto

Aplicar na prática:

Arquitetura em camadas

Segurança com JWT

Boas práticas REST

Manipulação de dados no frontend

Integração backend + frontend

Visualização de dados com gráficos

👨‍💻 Autor

Vitor Abe Prates

Backend Developer (Java | Spring Boot)

Estudante de Análise e Desenvolvimento de Sistemas

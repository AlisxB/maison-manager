# Maison Manager

**Maison Manager** é um sistema completo e moderno para gestão de condomínios, focado em segurança, eficiência e experiência do usuário.

Desenvolvido com uma arquitetura robusta, utiliza criptografia de ponta a ponta e políticas de segurança a nível de banco de dados (Row Level Security).

## 🚀 Tecnologias Utilizadas

### Frontend
- **Framework:** React 19 (Vite)
- **Estilização:** TailwindCSS (Design Moderno e Responsivo)
- **Ícones:** Lucide React
- **Gráficos:** Recharts

### Backend
- **Framework:** FastAPI (Python)
- **Banco de Dados:** PostgreSQL 15
- **ORM:** SQLAlchemy (Async) + Pydantic
- **Segurança:** 
    - RBAC (Role-Based Access Control)
    - RLS (Row Level Security) - Isolamento de dados direto no SQL
    - Pgcrypto (Criptografia de dados sensíveis em repouso)

### Infraestrutura
- **Docker & Docker Compose** para orquestração de containers.

## ✨ Funcionalidades Principais

- **🏠 Gestão de Unidades e Moradores**: Controle completo de blocos, apartamentos, proprietários e inquilinos.
- **🛡️ Segurança Avançada**: Dados sensíveis (CPF, Email, Telefone) criptografados no banco.
- **📝 Intercorrências**: 
    - Moradores podem relatar problemas (Barulho, Manutenção, etc.).
    - Opção de denúncia anônima.
    - Acompanhamento de status e resposta da administração.
- **📅 Reservas de Áreas Comuns**: 
    - Agendamento de salão de festas, churrasqueira, etc.
    - Regras de conflito de horário e limites por unidade.
- **💰 Gestão Financeira**: Controle de receitas e despesas.
- **📊 Leituras de Consumo**: Registro e acompanhamento de água, gás e energia.
- **🐾 Pets e Veículos**: Cadastro detalhado para controle de portaria.

## 🛠️ Como Rodar o Projeto

### Pré-requisitos
- Docker e Docker Compose instalados.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/AlisxB/maison-manager.git
   cd maison-manager
   ```

2. **Inicie os containers:**
   ```bash
   docker-compose up --build
   ```
   Isso irá subir o banco de dados PostgreSQL e a API Backend.

3. **Inicie o Frontend:**
   Em um novo terminal, na raiz do projeto:
   ```bash
   npm install
   npm run dev
   ```

4. **Acesse as aplicações:**
   - **Frontend:** http://localhost:5173
   - **API Docs (Swagger):** http://localhost:8000/docs

## 🔐 Credenciais Padrão (Ambiente de Desenvolvimento)

O banco de dados é inicializado automaticamente com dados de teste (`backend/db/init.sql`).

- **Super Admin:**
    - Email: `admin@maison.com`
    - Senha: `admin`

## 📁 Estrutura do Projeto

- `/src`: Código fonte do Frontend (React).
- `/backend`: Código fonte da API (FastAPI) e migrações.
- `/backend/app/models`: Modelos SQLAlchemy definindo o Schema.
- `/backend/db/init.sql`: Script de inicialização do banco, RLS e Policies.

---

<div align="center">
Desenvolvido com ❤️ por AlisxB
</div>

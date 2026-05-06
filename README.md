<img width="758" height="217" alt="image" src="https://github.com/user-attachments/assets/3814fbc5-85f3-4845-b2cb-4e98f6943f73" />


Interface web do acervo de livros construída em **Angular 21** com **Tailwind CSS v4**. Consome a API do backend Laravel e oferece CRUD completo de livros, autores e assuntos, além de um relatório agrupado por autor.

> Este repositório é o frontend do projeto. O backend está em [`books-service/backend`](../backend).

---

## Como rodar

### Pré-requisitos

- Node 20+ (desenvolvido com Node 24)
- npm 10+
- Backend rodando em `http://localhost:8000` — veja o README do backend para subir com Docker

---

### 1. Instalar dependências

```bash
npm install
```

---

### 2. Subir o servidor de desenvolvimento

```bash
npm start
```

Acesse **http://localhost:4200**

O comando compila o CSS global com Tailwind antes de subir, então na primeira vez pode levar alguns segundos a mais.

---

### 3. Build para produção

```bash
npm run build
```

Os arquivos ficam em `dist/`.

---

### 4. Rodar os testes

```bash
npm test
```

Os testes rodam com **Vitest** direto no terminal, sem precisar de browser.

---

## Páginas disponíveis

| Rota | O que faz |
|---|---|
| `/dashboard` | Visão geral do acervo com destaques e vitrine de livros |
| `/livros` | Lista paginada com filtro por assunto, ordenação e busca |
| `/livros/:id` | Detalhe completo do livro |
| `/autores` | CRUD de autores |
| `/assuntos` | CRUD de assuntos |
| `/relatorio` | Relatório de livros agrupados por autor |

---

## O que foi construído e por quê

## Resumo arquitetural (clean code)

Pensando na manutenção do projeto (e não só em “fazer funcionar”), a implementação seguiu alguns princípios simples:

- **Separação de responsabilidades**: UI, regras de negócio, estado e integração HTTP ficam em camadas diferentes.
- **Componentes pequenos e focados**: cada tela/componente tenta resolver um problema por vez.
- **Código previsível**: nomes explícitos, poucos efeitos colaterais e fluxo de dados mais fácil de seguir.
- **Reuso de utilitários**: formatação BRL, fallback de capa e helpers ficam centralizados para evitar duplicação.
- **Evolução gradual da arquitetura**: o módulo `books` já está estruturado em estilo mais “domínio/aplicação/apresentação”, preparando o terreno para crescer sem virar “bola de neve”.

Em resumo: a proposta foi equilibrar entrega rápida com base técnica sólida para continuar evoluindo o sistema com segurança.

---

### Angular 21 com componentes standalone

Sem `NgModule`. Cada componente declara suas próprias dependências via `imports`, o que torna cada arquivo mais autossuficiente e fácil de entender isoladamente. O roteamento usa lazy loading em todas as páginas — o browser só carrega o código de uma página quando o usuário navega até ela.

### Tailwind CSS v4

A versão 4 do Tailwind muda bastante o modelo: não há mais `tailwind.config.js` para configurar tokens, tudo é feito diretamente no CSS com variáveis nativas. O CSS global fica em `src/styles/` e é compilado por um script Node antes de servir.

### Arquitetura de pastas

O módulo `books` (ainda em evolução) segue uma separação em camadas:

```
modules/books/
├── core/
│   ├── types/          # Contratos de dados
│   ├── states/         # Estado reativo com signals
│   ├── services/domain/   # Regras de negócio do lado cliente
│   └── services/application/  # Facade que orquestra estado + API
├── integrations/api/   # Chamadas HTTP puras
└── presentation/       # Componentes, containers e páginas
```

As páginas do módulo `terra/` são a implementação principal do desafio — CRUD funcional conectado à API.

### Comunicação com o backend

Toda comunicação HTTP passa pelo `BibliotecaApiService` (`src/app/terra/services/biblioteca-api.service.ts`). A base URL aponta para `http://localhost:8000/api` — se o backend estiver em outro endereço, é só alterar ali.

### Formatação de moeda

O campo `valor` usa máscara BRL em tempo real durante a digitação (`src/app/terra/utils/brl-input-mask.ts`) e é exibido formatado em todas as listagens com `Intl.NumberFormat` em pt-BR.

### Testes

14 testes unitários cobrindo o componente principal: criação, filtros por assunto, ordenação A-Z / por ano / por valor, e montagem dos itens de navegação.

---

## Variáveis e configuração

A base URL da API está em `src/app/terra/services/biblioteca-api.service.ts`:

```typescript
const API = 'http://localhost:8000/api';
```

Para apontar para outro ambiente, altere essa constante antes do build.

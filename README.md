
# RequestBin Clone

Este projeto é um clone simples do RequestBin, criado para capturar e visualizar requisições HTTP recebidas. Ele é dividido em duas partes: um backend em Node.js para lidar com as requisições e um frontend em React para visualizar as requisições.

## Estrutura do Projeto

```
/backend
/frontend
.gitignore
README.md
```

## Configuração

### Pré-requisitos

Certifique-se de ter o Node.js e npm instalados em sua máquina. Você pode verificar se o Node.js está instalado executando o seguinte comando:

```bash
node -v
```

E para verificar o npm:

```bash
npm -v
```

# Backend Mock API

Este projeto é uma pequena aplicação Node.js com **Express** para simular requisições de uma API.

- Captura requisições recebidas (útil para debugging).
- Pode simular um **endpoint de login** que retorna um JWT de teste, configurável via `.env`.
- **Novo:** permite configurar **múltiplas rotas mock** via `.env`, devolvendo o conteúdo de arquivos JSON na pasta `mocks/`.

---

## ⚙️ Instalação

```bash
cd backend
npm install
node index.js
```

O servidor inicia por padrão na porta `3000`.

---

## 🔑 Simulação de Token (opcional)

Crie um `.env` com:

```env
# Habilitar/Desabilitar a simulação de token
TOKEN_ENABLE=true

# Rota e método para obter o token
TOKEN_ROUTE=/login
TOKEN_METHOD=POST

# Nome do campo no JSON de resposta
TOKEN_FIELD=access_token

# Configurações do JWT
JWT_SECRET=troque-isto-em-producao
JWT_ALG=HS256
JWT_TTL=3600

# Extras opcionais
TOKEN_TYPE=Bearer
INCLUDE_EXPIRES_IN=true
INCLUDE_REFRESH_TOKEN=false
```

**Exemplo de resposta do `/login`:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## 🧩 Rotas Mock Dinâmicas (multi-URL)

Você pode configurar **quantas rotas quiser** via `.env`, apontando para arquivos JSON na pasta `mocks/`.  
Use as chaves numeradas `MOCK_{N}_*`.

### Variáveis globais

```env
# Quantos mocks ativos (1..N)
MOCK_COUNT=2

# Pasta onde ficam os JSONs de resposta (relativa ao projeto)
MOCK_RESP_DIR=./mocks
```

### Para cada mock (exemplo com 2 rotas)

```env
# MOCK 1
MOCK_1_ROUTE=/users
MOCK_1_METHOD=GET
MOCK_1_FILE=users.json
MOCK_1_STATUS=200
MOCK_1_HEADERS={"x-mock":"users"}
MOCK_1_DELAY_MS=0
MOCK_1_CONTENT_TYPE=application/json

# MOCK 2
MOCK_2_ROUTE=/orders
MOCK_2_METHOD=POST
MOCK_2_FILE=create-order.json
MOCK_2_STATUS=201
MOCK_2_HEADERS={}
MOCK_2_DELAY_MS=300
MOCK_2_CONTENT_TYPE=application/json
```

> **Observações**
>
> - `MOCK_{N}_FILE` deve existir dentro de `MOCK_RESP_DIR`.
> - `MOCK_{N}_HEADERS` é um JSON válido de cabeçalhos extras (opcional).
> - `MOCK_{N}_DELAY_MS` adiciona atraso artificial (opcional).
> - `MOCK_{N}_CONTENT_TYPE` permite retornar outros formatos (ex.: `text/plain`).

### Pasta `mocks/` (exemplos)

- `mocks/users.json`
- `mocks/create-order.json`

Conteúdo de exemplo:

`mocks/users.json`

```json
[
  { "id": 1, "name": "Ada Lovelace" },
  { "id": 2, "name": "Grace Hopper" }
]
```

`mocks/create-order.json`

```json
{
  "orderId": "ord_123",
  "status": "created"
}
```

---

## 📋 Variáveis de Ambiente (tabela)

| Variável                  | Descrição                                              | Padrão                     |
|--------------------------|--------------------------------------------------------|----------------------------|
| `PORT`                   | Porta do servidor                                      | `3000`                     |
| `TOKEN_ENABLE`           | Ativa/desativa a simulação de login                    | `true`                     |
| `TOKEN_ROUTE`            | Rota do endpoint de login fake                         | `/login`                   |
| `TOKEN_METHOD`           | Método HTTP do login (POST, GET, etc)                  | `POST`                     |
| `TOKEN_FIELD`            | Nome do campo de retorno do token                      | `access_token`             |
| `JWT_SECRET`             | Segredo usado para assinar o JWT                       | `dev-secret-change-me`     |
| `JWT_ALG`                | Algoritmo do JWT                                       | `HS256`                    |
| `JWT_TTL`                | Tempo de expiração do token (segundos)                 | `3600`                     |
| `TOKEN_TYPE`             | Tipo do token retornado (ex.: `Bearer`)                | `Bearer`                   |
| `INCLUDE_EXPIRES_IN`     | Inclui `expires_in` na resposta (`true/false`)         | `true`                     |
| `INCLUDE_REFRESH_TOKEN`  | Inclui `refresh_token` na resposta (`true/false`)      | `false`                    |
| `MOCK_COUNT`             | Quantidade de mocks dinâmicos                           | `0`                        |
| `MOCK_RESP_DIR`          | Pasta base para arquivos de resposta                   | `./mocks`                  |
| `MOCK_{N}_ROUTE`         | Rota do mock (ex.: `/users`)                           | —                          |
| `MOCK_{N}_METHOD`        | Método HTTP (`GET`, `POST`, ...)                       | `GET`                      |
| `MOCK_{N}_FILE`          | Arquivo de resposta dentro de `MOCK_RESP_DIR`          | —                          |
| `MOCK_{N}_STATUS`        | Status HTTP de resposta                                | `200`                      |
| `MOCK_{N}_HEADERS`       | JSON de cabeçalhos extras (ex.: `{"x-a":"1"}`)         | `{}`                       |
| `MOCK_{N}_DELAY_MS`      | Atraso artificial em ms                                | `0`                        |
| `MOCK_{N}_CONTENT_TYPE`  | Content-Type da resposta                               | `application/json`         |

---

## 📚 Endpoints padrão

- `POST *` → Captura qualquer requisição **POST** enviada (fallback).
- `GET /requests` → Lista requisições armazenadas.
- `DELETE /requests` → Limpa as requisições.
- `GET /health` → Healthcheck.
- `[TOKEN_METHOD] /login` → JWT fake (se `TOKEN_ENABLE=true`).
- **+ Rotas mock dinâmicas** conforme seu `.env`.

### Frontend

1. Navegue até a pasta `frontend`:

   ```bash
   cd frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure a URL da API (opcional).  
   Por padrão, o frontend acessa `http://localhost:3000`.  
   Se o backend estiver em outra porta/host, crie um arquivo `.env` na raiz do projeto:

   #### Se estiver usando **Create React App (CRA)**

   ```env
   REACT_APP_API_BASE_URL=http://localhost:3000
   ```

   #### Se estiver usando **Vite**

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

   > ⚠️ Após alterar/criar o `.env`, reinicie o servidor de desenvolvimento.

4. Inicie o servidor de desenvolvimento:

   ```bash
   # CRA
   npm start

   # ou, se estiver usando Vite
   npm run dev
   ```

   O servidor React será iniciado normalmente em `http://localhost:3000` (CRA)  
   ou em `http://localhost:5173` (Vite).

## Funcionalidades

- **Backend:** Recebe requisições HTTP de qualquer método e caminho, armazenando seus detalhes.
- **Frontend:** Exibe uma lista das requisições recebidas, permitindo que você veja detalhes específicos de cada uma.

## Uso

- Envie requisições HTTP para o backend em `http://localhost:3000/[your-path]`.
- Visualize as requisições no frontend em `http://localhost:3000`.

## Limpar Requisições

No frontend, há um botão "Clear Requests" para limpar todas as requisições armazenadas.

## Personalização

Você pode personalizar o projeto alterando as rotas no backend ou ajustando o design no frontend. Sinta-se à vontade para contribuir e melhorar este projeto!

## Contribuição

Se você deseja contribuir para este projeto, por favor, siga os passos abaixo:

1. Faça um fork do repositório.
2. Crie uma nova branch: `git checkout -b minha-branch`.
3. Faça suas alterações e commite: `git commit -m 'Minhas alterações'`.
4. Envie suas alterações: `git push origin minha-branch`.
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

Se você encontrar algum problema ou tiver sugestões, sinta-se à vontade para abrir uma issue ou contribuir diretamente com o projeto. Aproveite o uso!

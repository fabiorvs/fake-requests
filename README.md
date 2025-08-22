
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
Ele captura requisições recebidas e permite inspecionar os dados enviados.
Além disso, pode simular um **endpoint de login** que retorna um JWT de teste, configurável via `.env`.

---

## ⚙️ Instalação

1. Navegue até a pasta `backend`:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor:

   ```bash
   node index.js
   ```

   O servidor será iniciado na porta `3000` por padrão.

---

## 🔑 Simulação de Token (opcional)

Você pode configurar um endpoint de **login fake** que retorna um JWT de teste.  
Basta criar um arquivo `.env` na pasta `backend` com as variáveis abaixo:

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

### 📌 Exemplo de resposta do `/login`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Se quiser mudar o nome do campo (ex.: `token`), basta alterar no `.env`:

```env
TOKEN_FIELD=token
```

---

## 📋 Variáveis de Ambiente

| Variável                | Descrição                                    | Padrão     |
|--------------------------|----------------------------------------------|------------|
| `PORT`                   | Porta do servidor                            | `3000`     |
| `TOKEN_ENABLE`           | Ativa/desativa a simulação de login          | `true`     |
| `TOKEN_ROUTE`            | Rota do endpoint de login fake               | `/login`   |
| `TOKEN_METHOD`           | Método HTTP do login (POST, GET, etc)        | `POST`     |
| `TOKEN_FIELD`            | Nome do campo de retorno do token            | `access_token` |
| `JWT_SECRET`             | Segredo usado para assinar o JWT             | `dev-secret-change-me` |
| `JWT_ALG`                | Algoritmo do JWT                             | `HS256`    |
| `JWT_TTL`                | Tempo de expiração do token (segundos)       | `3600`     |
| `TOKEN_TYPE`             | Tipo do token retornado (ex.: `Bearer`)      | `Bearer`   |
| `INCLUDE_EXPIRES_IN`     | Inclui `expires_in` na resposta (`true/false`)| `true`     |
| `INCLUDE_REFRESH_TOKEN`  | Inclui `refresh_token` na resposta (`true/false`)| `false` |

---

## 📚 Endpoints disponíveis

- `POST *` → Captura qualquer requisição enviada e armazena.
- `GET /requests` → Lista todas as requisições armazenadas.
- `DELETE /requests` → Limpa as requisições armazenadas.
- `GET /health` → Verifica se o servidor está ativo.
- `[TOKEN_METHOD] /login` (configurável via `.env`) → Retorna um JWT fake.

### Frontend

1. Navegue até a pasta `frontend`:

   ```bash
   cd frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm start
   ```

   O servidor de desenvolvimento React será iniciado em `http://localhost:3000`.

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


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

### Backend

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
   node server.js
   ```

   O servidor será iniciado na porta `3000` por padrão.

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

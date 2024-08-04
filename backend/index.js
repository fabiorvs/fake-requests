const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid"); // Importar a função para gerar UUIDs
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Armazenar requisições recebidas
let requests = [];

// Endpoint para receber requisições POST em qualquer URL
app.post("*", (req, res) => {
  const { method, headers, body, query, path } = req;
  const requestData = {
    id: uuidv4(), // Adicionar um ID único
    method,
    path,
    headers,
    body,
    query,
    timestamp: new Date(),
  };
  requests.push(requestData);
  res.status(200).send("Request received");
});

// Endpoint para visualizar requisições armazenadas
app.get("/requests", (req, res) => {
  res.json(requests);
});

// Limpar requisições
app.delete("/requests", (req, res) => {
  requests = [];
  res.send("Requests cleared");
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

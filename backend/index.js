const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
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
    id: uuidv4(),
    method,
    path,
    headers,
    body,
    query,
    timestamp: new Date(),
  };
  requests.push(requestData);
  res.status(200).json({
    status: "success",
    message: "Request received",
    data: requestData,
  });
});

// Endpoint para visualizar requisições armazenadas
app.get("/requests", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Requests retrieved successfully",
    data: requests,
  });
});

// Limpar requisições
app.delete("/requests", (req, res) => {
  requests = [];
  res.status(200).json({
    status: "success",
    message: "Requests cleared",
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

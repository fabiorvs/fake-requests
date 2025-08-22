// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== Config via .env ====
const {
  PORT = 3000,
  // Simulação de token
  TOKEN_ENABLE = "true",
  TOKEN_ROUTE = "/login",
  TOKEN_METHOD = "POST", // POST | GET | etc
  TOKEN_FIELD = "access_token",
  TOKEN_STATUS = "200",

  // JWT
  JWT_SECRET = "dev-secret-change-me",
  JWT_ALG = "HS256",
  JWT_TTL = "3600", // segundos

  // Resposta extra
  TOKEN_TYPE = "Bearer",
  INCLUDE_EXPIRES_IN = "true",
  INCLUDE_REFRESH_TOKEN = "false",
} = process.env;

// Armazenar requisições recebidas
let requests = [];

// --- Util: gerar payload JWT básico ---
function buildJwtPayload(req) {
  // Você pode adaptar esse payload para o que precisar
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: "mock-user-id",
    iss: "mock-api",
    iat: now,
    // dados úteis do request
    meta: {
      ip: req.ip,
      ua: req.headers["user-agent"] || null,
      path: req.path,
    },
  };
}

// --- Endpoint de token configurável ---
if (TOKEN_ENABLE === "true") {
  const method = TOKEN_METHOD.toLowerCase();

  app[method](TOKEN_ROUTE, (req, res) => {
    try {
      const payload = buildJwtPayload(req);
      const token = jwt.sign(payload, JWT_SECRET, {
        algorithm: JWT_ALG,
        expiresIn: Number(JWT_TTL) || 3600,
      });

      const response = {
        [TOKEN_FIELD]: token,
      };

      if (TOKEN_TYPE) {
        response.token_type = TOKEN_TYPE;
      }
      if (INCLUDE_EXPIRES_IN === "true") {
        response.expires_in = Number(JWT_TTL) || 3600;
      }
      if (INCLUDE_REFRESH_TOKEN === "true") {
        response.refresh_token = uuidv4();
      }

      return res.status(Number(TOKEN_STATUS) || 200).json(response);
    } catch (err) {
      return res.status(500).json({
        error: "token_generation_failed",
        message: err.message,
      });
    }
  });
}

// --- Capturar POST em qualquer rota (exceto a de token, já coberta acima) ---
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

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

// Iniciar o servidor
app.listen(Number(PORT), () => {
  console.log(`Server is running on port ${PORT}`);
  if (TOKEN_ENABLE === "true") {
    console.log(
      `Token mock habilitado em [${TOKEN_METHOD}] ${TOKEN_ROUTE} retornando campo "${TOKEN_FIELD}"`
    );
  }
});

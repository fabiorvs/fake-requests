// server.js (mock API avançada) - com logging unificado para token, mocks e fallback
require("dotenv").config();

const fs = require("fs");
const path = require("path");
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
  JWT_SECRET = "dev-secret-change-me",
  JWT_ALG = "HS256",
  JWT_TTL = "3600", // segundos
  TOKEN_TYPE = "Bearer",
  INCLUDE_EXPIRES_IN = "true",
  INCLUDE_REFRESH_TOKEN = "false",

  // Mock de rotas dinâmicas
  MOCK_COUNT = "0", // total de mocks configurados via .env (MOCK_1_*, MOCK_2_*, ...)
  MOCK_RESP_DIR = "./mocks", // pasta onde ficam os JSONs de retorno

  // Logging
  LOG_RESPONSE_BODY_MAX = "2048" // bytes (para evitar payloads gigantes no /requests)
} = process.env;

const LOG_MAX = Number(LOG_RESPONSE_BODY_MAX) || 2048;

// Armazenar requisições recebidas
let requests = [];

// --- Util: gerar payload JWT básico ---
function buildJwtPayload(req) {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: "mock-user-id",
    iss: "mock-api",
    iat: now,
    meta: {
      ip: req.ip,
      ua: req.headers["user-agent"] || null,
      path: req.path
    }
  };
}

// --- Util: logger unificado ---
function safeSliceBuffer(buf, max) {
  if (!Buffer.isBuffer(buf)) return buf;
  if (buf.length <= max) return buf;
  return Buffer.concat([buf.subarray(0, max), Buffer.from(`... [truncated ${buf.length - max} bytes]`)]);
}

function safeStringify(obj, max) {
  try {
    const s = JSON.stringify(obj);
    if (s.length <= max) return s;
    return s.slice(0, max) + `... [truncated ${s.length - max} chars]`;
  } catch {
    return "[unserializable]";
  }
}

function recordRequest({ req, resStatus, resHeaders = {}, resBody, routeType, mockId = null }) {
  const { method, headers, body, query, path: reqPath } = req;
  const entry = {
    id: uuidv4(),
    routeType,            // "token" | "mock" | "fallback"
    mockId,               // número do mock quando aplicável
    method,
    path: reqPath,
    headers,
    body,
    query,
    response: {
      status: resStatus,
      headers: resHeaders,
      bodyPreview:
        Buffer.isBuffer(resBody)
          ? safeSliceBuffer(resBody, LOG_MAX).toString()
          : typeof resBody === "string"
            ? (resBody.length <= LOG_MAX ? resBody : resBody.slice(0, LOG_MAX) + `... [truncated ${resBody.length - LOG_MAX} chars]`)
            : safeStringify(resBody, LOG_MAX)
    },
    timestamp: new Date()
  };
  requests.push(entry);
  return entry;
}

// --- Endpoint de token configurável ---
if (TOKEN_ENABLE === "true") {
  const method = (TOKEN_METHOD || "POST").toLowerCase();

  app[method](TOKEN_ROUTE, (req, res) => {
    try {
      const payload = buildJwtPayload(req);
      const token = jwt.sign(payload, JWT_SECRET, {
        algorithm: JWT_ALG,
        expiresIn: Number(JWT_TTL) || 3600
      });

      const response = {
        [TOKEN_FIELD]: token
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

      const status = Number(TOKEN_STATUS) || 200;

      // Log antes de enviar
      recordRequest({
        req,
        resStatus: status,
        resHeaders: { "Content-Type": "application/json" },
        resBody: response,
        routeType: "token"
      });

      return res.status(status).json(response);
    } catch (err) {
      const status = 500;
      const response = { error: "token_generation_failed", message: err.message };

      recordRequest({
        req,
        resStatus: status,
        resHeaders: { "Content-Type": "application/json" },
        resBody: response,
        routeType: "token"
      });

      return res.status(status).json(response);
    }
  });
}

// --- Registrar mocks dinâmicos definidos no .env ---
function registerMockRoutesFromEnv(app) {
  const count = Number(MOCK_COUNT) || 0;
  const baseDir = path.resolve(MOCK_RESP_DIR);

  for (let i = 1; i <= count; i++) {
    const prefix = `MOCK_${i}_`;
    const route = process.env[`${prefix}ROUTE`];
    const method = (process.env[`${prefix}METHOD`] || "GET").toLowerCase();
    const file = process.env[`${prefix}FILE`]; // arquivo JSON de resposta (relativo a MOCK_RESP_DIR)
    const status = Number(process.env[`${prefix}STATUS`] || "200");
    const headersJson = process.env[`${prefix}HEADERS`] || "{}";
    const delayMs = Number(process.env[`${prefix}DELAY_MS`] || "0");
    const contentType = process.env[`${prefix}CONTENT_TYPE`] || "application/json";

    if (!route || !file) {
      console.warn(`[mock:${i}] Ignorado: ROUTE ou FILE não definido`);
      continue;
    }

    let headers;
    try {
      headers = JSON.parse(headersJson);
    } catch {
      console.warn(`[mock:${i}] HEADERS inválido, usando objeto vazio`);
      headers = {};
    }

    const fullpath = path.join(baseDir, file);

    if (!fs.existsSync(fullpath)) {
      console.warn(`[mock:${i}] Arquivo de resposta não encontrado: ${fullpath}`);
      continue;
    }

    app[method](route, async (req, res) => {
      try {
        let body;
        if (contentType.includes("application/json")) {
          const raw = fs.readFileSync(fullpath, "utf-8");
          body = JSON.parse(raw);
        } else {
          body = fs.readFileSync(fullpath); // Buffer
        }

        // aplica cabeçalhos custom
        Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
        res.setHeader("Content-Type", contentType);

        const sendResponse = () => {
          // Log antes de enviar
          recordRequest({
            req,
            resStatus: status,
            resHeaders: { ...headers, "Content-Type": contentType },
            resBody: body,
            routeType: "mock",
            mockId: i
          });

          if (contentType.includes("application/json")) {
            res.status(status).json(body);
          } else {
            res.status(status).send(body);
          }
        };

        if (delayMs > 0) {
          setTimeout(sendResponse, delayMs);
        } else {
          sendResponse();
        }
      } catch (err) {
        const response = { error: "mock_route_failure", message: err.message };
        recordRequest({
          req,
          resStatus: 500,
          resHeaders: { "Content-Type": "application/json" },
          resBody: response,
          routeType: "mock",
          mockId: i
        });
        res.status(500).json(response);
      }
    });

    console.log(`[mock:${i}] Registrado: [${method.toUpperCase()}] ${route} -> ${fullpath} (status ${status}${delayMs ? `, delay ${delayMs}ms` : ""})`);
  }
}

registerMockRoutesFromEnv(app);

// --- Capturar POST em qualquer rota (fallback) ---
app.post("*", (req, res) => {
  const { method, headers, body, query, path: reqPath } = req;
  const requestData = {
    id: uuidv4(),
    method,
    path: reqPath,
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

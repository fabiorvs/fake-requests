import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

// Resolve API base URL para Vite (VITE_API_BASE_URL) ou CRA (REACT_APP_API_BASE_URL)
let API_BASE = "http://localhost:3000";
try {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL
  ) {
    API_BASE = import.meta.env.VITE_API_BASE_URL;
  } else if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE_URL
  ) {
    API_BASE = process.env.REACT_APP_API_BASE_URL;
  }
} catch (_) {
  // mantém default
}

const METHOD_COLORS = {
  GET: "#2e86de",
  POST: "#27ae60",
  PUT: "#f39c12",
  PATCH: "#8e44ad",
  DELETE: "#e74c3c",
};

function Badge({ children, color = "#555" }) {
  return (
    <span className="badge" style={{ background: color }}>
      {children}
    </span>
  );
}

function Toolbar({
  refreshMs,
  setRefreshMs,
  methodFilter,
  setMethodFilter,
  typeFilter,
  setTypeFilter,
  search,
  setSearch,
  onClear,
  paused,
  setPaused,
  pinSelection,
  setPinSelection,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-row">
        <label>
          Atualização (ms):
          <input
            type="number"
            min={500}
            step={500}
            value={refreshMs}
            onChange={(e) => setRefreshMs(Number(e.target.value || 2000))}
          />
        </label>

        <label>
          Método:
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
        </label>

        <label>
          Tipo:
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="token">token</option>
            <option value="mock">mock</option>
            <option value="fallback">fallback</option>
          </select>
        </label>

        <label className="grow">
          Buscar (path/headers):
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="/login, x-mock, authorization…"
          />
        </label>

        <label title="Impede que a seleção mude sozinha">
          <input
            type="checkbox"
            checked={pinSelection}
            onChange={(e) => setPinSelection(e.target.checked)}
          />
          Fixar seleção
        </label>

        <label title="Pausa o auto-refresh">
          <input
            type="checkbox"
            checked={paused}
            onChange={(e) => setPaused(e.target.checked)}
          />
          Pausar
        </label>

        <button className="danger" onClick={onClear}>
          Limpar registros
        </button>
      </div>
      <div className="toolbar-hint">
        Base da API: <code>{API_BASE}</code>
      </div>
    </div>
  );
}

function RequestList({ requests, onSelect, selectedId, lastFetchAt }) {
  return (
    <ul className="list">
      {requests.map((r) => {
        const method = r.method?.toUpperCase?.() || r.method;
        const isSelected = selectedId === r.id;
        const isNew = lastFetchAt && new Date(r.timestamp) > lastFetchAt;
        const color = METHOD_COLORS[method] || "#555";
        return (
          <li
            key={r.id}
            className={`item ${isSelected ? "selected" : ""}`}
            onClick={() => onSelect(r.id)}
            title={r.routeType ? `tipo: ${r.routeType}` : ""}
          >
            <strong style={{ color }}>{method}</strong>{" "}
            <span className="path">{r.path}</span>
            {r.routeType && (
              <Badge
                color={
                  r.routeType === "mock"
                    ? "#6c5ce7"
                    : r.routeType === "token"
                    ? "#00b894"
                    : "#636e72"
                }
              >
                {r.routeType}
              </Badge>
            )}
            {isNew && <Badge color="#e84393">novo</Badge>}
            <div className="ts">{new Date(r.timestamp).toLocaleString()}</div>
          </li>
        );
      })}
    </ul>
  );
}

function JsonBlock({ data }) {
  return <pre className="code">{JSON.stringify(data ?? {}, null, 2)}</pre>;
}

function RequestDetails({ req }) {
  if (!req) return <p>Selecione uma request para ver os detalhes.</p>;

  const copyCurl = async () => {
    try {
      const url = `${API_BASE}${req.path || ""}`;
      const method = (req.method || "GET").toUpperCase();
      const headers = req.headers || {};
      const body = req.body;

      let curl = [`curl -i -X ${method} '${url}'`];
      Object.entries(headers).forEach(([k, v]) => {
        if (k && v && !String(k).startsWith(":")) {
          curl.push(`-H ${JSON.stringify(`${k}: ${v}`)}`);
        }
      });
      if (body && Object.keys(body).length && method !== "GET") {
        curl.push(`--data ${JSON.stringify(JSON.stringify(body))}`);
      }
      await navigator.clipboard.writeText(curl.join(" \\\n  "));
      alert("cURL copiado!");
    } catch (e) {
      console.error(e);
      alert("Não foi possível copiar o cURL.");
    }
  };

  return (
    <div>
      <div className="details-header">
        <h2>Detalhes</h2>
        <button onClick={copyCurl}>Copiar cURL</button>
      </div>
      <div className="grid">
        <div>
          <p>
            <strong>Método:</strong> {req.method}
          </p>
          <p>
            <strong>Path:</strong> {req.path}
          </p>
          {req.routeType && (
            <p>
              <strong>Tipo:</strong> {req.routeType}
              {req.mockId ? ` #${req.mockId}` : ""}
            </p>
          )}
          <p>
            <strong>Quando:</strong> {new Date(req.timestamp).toLocaleString()}
          </p>
        </div>
        {req.response && (
          <div>
            <p>
              <strong>Status:</strong> {req.response.status}
            </p>
            <p>
              <strong>Headers (res):</strong>
            </p>
            <JsonBlock data={req.response.headers || {}} />
            <p>
              <strong>Body (preview):</strong>
            </p>
            <pre className="code">
              {typeof req.response.bodyPreview === "string"
                ? req.response.bodyPreview
                : JSON.stringify(req.response.bodyPreview ?? {}, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <h3>Headers (req)</h3>
      <JsonBlock data={req.headers || {}} />

      <h3>Body (req)</h3>
      <JsonBlock data={req.body || {}} />

      <h3>Query (req)</h3>
      <JsonBlock data={req.query || {}} />
    </div>
  );
}

export default function App() {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshMs, setRefreshMs] = useState(2000);
  const [methodFilter, setMethodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);
  const [pinSelection, setPinSelection] = useState(true);

  const lastFetchAtRef = useRef(null);
  const firstLoadRef = useRef(false);
  const pauseTimerRef = useRef(null);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/requests`, {
        timeout: 5000,
      });
      const arr = response.data?.data || [];
      const sorted = arr
        .slice()
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRequests(sorted);
      lastFetchAtRef.current = new Date();

      // Auto-select somente no primeiro load
      if (!firstLoadRef.current) {
        firstLoadRef.current = true;
        if (!selectedId && sorted.length) setSelectedId(sorted[0].id);
      }

      // Se o item selecionado sumir e a seleção não estiver "fixa", zera seleção
      if (
        selectedId &&
        !sorted.find((r) => r.id === selectedId) &&
        !pinSelection
      ) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(fetchRequests, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs, paused]);

  const clearRequests = async () => {
    try {
      await axios.delete(`${API_BASE}/requests`);
      setRequests([]);
      setSelectedId(null);
    } catch (error) {
      console.error("Error clearing requests:", error);
    }
  };

  const filtered = useMemo(() => {
    const term = (search || "").toLowerCase();
    return requests.filter((r) => {
      const mOk = methodFilter
        ? r.method?.toUpperCase() === methodFilter
        : true;
      const tOk = typeFilter ? r.routeType === typeFilter : true;
      const inPath = r.path?.toLowerCase().includes(term);
      const inHeaders = JSON.stringify(r.headers || {})
        .toLowerCase()
        .includes(term);
      return mOk && tOk && (!term || inPath || inHeaders);
    });
  }, [requests, methodFilter, typeFilter, search]);

  const selectedRequest =
    requests.find((r) => r.id === selectedId) ||
    filtered.find((r) => r.id === selectedId) ||
    null;

  const onSelect = (id) => {
    setSelectedId(id);
    // Pausa auto-refresh por 30s para análise confortável
    setPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setPaused(false), 30000);
  };

  return (
    <div className="App">
      <h1>Requests</h1>

      <Toolbar
        refreshMs={refreshMs}
        setRefreshMs={setRefreshMs}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        search={search}
        setSearch={setSearch}
        onClear={clearRequests}
        paused={paused}
        setPaused={setPaused}
        pinSelection={pinSelection}
        setPinSelection={setPinSelection}
      />

      <div className="container">
        <div className="request-list">
          <h2>Lista</h2>
          {filtered.length === 0 ? (
            <p>Nenhuma request encontrada.</p>
          ) : (
            <RequestList
              requests={filtered}
              selectedId={selectedId}
              onSelect={onSelect}
              lastFetchAt={lastFetchAtRef.current}
            />
          )}
        </div>

        <div className="request-details">
          <RequestDetails req={selectedRequest} />
        </div>
      </div>
    </div>
  );
}

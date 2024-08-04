import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get("http://localhost:3000/requests");
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
    const intervalId = setInterval(fetchRequests, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRequestClick = (request) => {
    setSelectedRequestId(request.id);
  };

  const handleClearRequests = async () => {
    try {
      await axios.delete("http://localhost:3000/requests");
      setRequests([]);
      setSelectedRequestId(null);
    } catch (error) {
      console.error("Error clearing requests:", error);
    }
  };

  const selectedRequest = requests.find((req) => req.id === selectedRequestId);

  return (
    <div className="App">
      <h1>Requests</h1>
      <div className="container">
        <div className="request-list">
          <h2>Requests</h2>
          <button onClick={handleClearRequests}>Clear Requests</button>
          {requests.length === 0 ? (
            <p>No requests received yet.</p>
          ) : (
            <ul>
              {requests.map((request) => (
                <li
                  key={request.id}
                  onClick={() => handleRequestClick(request)}
                  className={selectedRequestId === request.id ? "selected" : ""}
                >
                  <strong>{request.method}</strong> {request.path} -{" "}
                  {new Date(request.timestamp).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="request-details">
          {selectedRequest ? (
            <div>
              <h2>Request Details</h2>
              <p>
                <strong>Method:</strong> {selectedRequest.method}
              </p>
              <p>
                <strong>Path:</strong> {selectedRequest.path}
              </p>
              <p>
                <strong>Headers:</strong>{" "}
                <pre>{JSON.stringify(selectedRequest.headers, null, 2)}</pre>
              </p>
              <p>
                <strong>Body:</strong>{" "}
                <pre>{JSON.stringify(selectedRequest.body, null, 2)}</pre>
              </p>
              <p>
                <strong>Query:</strong>{" "}
                <pre>{JSON.stringify(selectedRequest.query, null, 2)}</pre>
              </p>
            </div>
          ) : (
            <p>Select a request to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

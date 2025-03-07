import { useEffect, useState } from 'react';

const WebhookLogs = () => {
  const [logs, setLogs] = useState('');

  useEffect(() => {
    const eventSource = new EventSource('/api/webhook');
    eventSource.onmessage = (event) => {
      setLogs((prev) => prev + event.data + "\n");
    };
    eventSource.onerror = (err) => {
      console.error("Error en EventSource:", err);
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h2>Logs en tiempo real</h2>
      <pre style={{ background: '#333', color: '#fff', padding: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
        {logs}
      </pre>
    </div>
  );
};

export default WebhookLogs;
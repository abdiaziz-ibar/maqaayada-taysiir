import { useEffect, useState } from "react";
import api from "../api/axios";
import { formatDate } from "../utils/format";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/audit-logs").then((res) => setLogs(res.data.logs));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Audit Logs</h1>
      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead><tr><th>Taariikh</th><th>Isticmaale</th><th>Ficilka</th><th>Module</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{formatDate(l.createdAt)}</td>
                <td>{l.user?.fullName || "System"}</td>
                <td className="capitalize">{l.action}</td>
                <td>{l.module}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4} className="text-center text-ink/40 py-6">Weli wax lama diiwaan gelin.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;

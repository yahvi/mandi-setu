import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [busyId, setBusyId] = useState(null);

  function load() {
    api.adminStats().then(setStats).catch(() => setStats(null));
    api.adminUsers().then(setUsers).catch(() => setUsers([]));
    api.adminDisputes().then(setDisputes).catch(() => setDisputes([]));
  }

  useEffect(load, []);

  async function verify(id) {
    setBusyId(id);
    try {
      await api.adminVerifyUser(id);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function resolveDispute(id, status) {
    const note = prompt(status === "resolved" ? "Resolution note (optional):" : "Reason for rejecting (optional):") || "";
    try {
      await api.adminResolveDispute(id, status, note);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="panel-page">
      <div className="panel-page__header"><h1>Admin Dashboard</h1></div>

      {stats && (
        <div className="admin-stats">
          {stats.usersByRole.map((r) => (
            <div className="admin-stat-card" key={r.role}>
              <div className="admin-stat-card__value">{r.count}</div>
              <div className="admin-stat-card__label">{r.role}s</div>
            </div>
          ))}
          <div className="admin-stat-card">
            <div className="admin-stat-card__value">{stats.activeListings}</div>
            <div className="admin-stat-card__label">active listings</div>
          </div>
          <div className="admin-stat-card admin-stat-card--warn">
            <div className="admin-stat-card__value">{stats.openDisputes}</div>
            <div className="admin-stat-card__label">open disputes</div>
          </div>
        </div>
      )}

      <h3 className="admin-section-title">Users</h3>
      <div className="admin-table-wrap">
        <table className="home__table">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Location</th><th>Rating</th><th>Verified</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.role}</td>
                <td>{u.location}</td>
                <td>{u.rating}\u2605</td>
                <td>{u.is_verified ? "\u2705 Verified" : "\u2014"}</td>
                <td>
                  {!u.is_verified && (
                    <button className="ghost-btn" disabled={busyId === u.id} onClick={() => verify(u.id)}>
                      {busyId === u.id ? "\u2026" : "Verify"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="admin-section-title">Disputes</h3>
      {disputes.length === 0 ? (
        <div className="home__empty">No disputes raised.</div>
      ) : (
        <div className="offer-list">
          {disputes.map((d) => (
            <div className="offer-card" key={d.id}>
              <div className="offer-card__main">
                <div className="offer-card__title">{d.crop} \u00b7 \u20b9{d.offer_price} \u2014 raised by {d.raised_by_name}</div>
                <div className="offer-card__meta">{d.reason}</div>
                {d.resolution_note && <div className="offer-card__meta">Resolution: {d.resolution_note}</div>}
              </div>
              <div className={`offer-card__status offer-card__status--${d.status === "open" ? "pending" : d.status === "resolved" ? "delivered" : "rejected"}`}>
                {d.status}
              </div>
              {d.status === "open" && (
                <div className="offer-card__actions">
                  <button className="ghost-btn" onClick={() => resolveDispute(d.id, "resolved")}>Resolve</button>
                  <button className="ghost-btn" onClick={() => resolveDispute(d.id, "rejected")}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

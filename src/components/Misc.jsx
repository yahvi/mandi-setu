```jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";

export function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.getAlerts()
      .then(setAlerts)
      .catch(() => setAlerts([]));
  }, []);

  async function markRead(id) {
    await api.markAlertRead(id).catch(() => {});

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, is_read: true }
          : a
      )
    );
  }

  return (
    <div className="panel-page">
      <div className="panel-page__header">
        <h1>Alerts</h1>
      </div>

      {alerts.length === 0 ? (
        <div className="home__empty">
          No alerts yet.
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={
                a.is_read
                  ? "alert-item"
                  : "alert-item alert-item--unread"
              }
              onClick={() => markRead(a.id)}
            >
              <span className="alert-item__dot" />
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Profile({ user }) {
  return (
    <div className="panel-page">
      <div className="panel-page__header">
        <h1>Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-card__avatar">
          {user.full_name?.charAt(0) || "?"}
        </div>

        <dl>
          <div>
            <dt>Name</dt>
            <dd>{user.full_name}</dd>
          </div>

          <div>
            <dt>Role</dt>
            <dd>
              {user.role === "farmer"
                ? "Farmer"
                : "Vendor / Trader"}
            </dd>
          </div>

          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>

          <div>
            <dt>Phone</dt>
            <dd>{user.phone || "—"}</dd>
          </div>

          <div>
            <dt>Location</dt>
            <dd>{user.location || "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
```


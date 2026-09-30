import React, { useEffect, useState } from "react";
import { api } from "../api";

const CROPS = ["Onion", "Tomato", "Wheat"];

export default function MarketPrices({ user }) {
  const [crop, setCrop] = useState(user.crop || CROPS[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .comparePrices(crop, user.lat, user.lng)
      .then((data) => !cancelled && setRows(data.rows || []))
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [crop]);

  return (
    <div className="panel-page">
      <div className="panel-page__header">
        <h1>Market Prices</h1>
        <select value={crop} onChange={(e) => setCrop(e.target.value)}>
          {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="home__empty">Loading prices\u2026</div>
      ) : (
        <div className="price-grid">
          {rows.map((r) => (
            <div className="price-card" key={r.mandi}>
              <div className="price-card__mandi">{r.mandi}</div>
              <div className="price-card__price">\u20b9{r.price.toLocaleString("en-IN")}</div>
              <div className={`price-card__trend price-card__trend--${r.trend}`}>
                {r.trend === "up" ? "\u25b2 rising" : r.trend === "down" ? "\u25bc falling" : "\u2014 steady"}
              </div>
              {r.distanceKm != null && (
                <div className="price-card__distance">{r.distanceKm} km \u00b7 net \u20b9{r.netPrice}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

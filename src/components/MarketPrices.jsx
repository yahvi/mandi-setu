import React, { useEffect, useState } from "react";
import { api } from "../api";

const CROPS = ["Onion", "Tomato", "Wheat"];

export default function MarketPrices({ user }) {
  const [crop, setCrop] = useState(user?.crop || CROPS[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    api
      .comparePrices(crop, user?.lat, user?.lng)
      .then((data) => {
        if (cancelled) return;

        setRows(Array.isArray(data?.rows) ? data.rows : []);

        if (
          !data?.rows ||
          !Array.isArray(data.rows) ||
          data.rows.length === 0
        ) {
          setError("No market price data is available right now.");
        }
      })
      .catch((err) => {
        if (cancelled) return;

        setRows([]);
        setError(
          err?.message ||
            "Unable to load market prices right now."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [crop, user?.lat, user?.lng]);

  return (
    <div className="panel-page">
      <div className="panel-page__header">
        <h1>Market Prices</h1>

        <select
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        >
          {CROPS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="home__empty">
          Loading prices…
        </div>
      ) : error ? (
        <div className="home__empty">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="home__empty">
          No market prices available.
        </div>
      ) : (
        <div className="price-grid">
          {rows.map((r) => {
            const price = Number(r.price);

            const formattedPrice = Number.isFinite(price)
              ? price.toLocaleString("en-IN")
              : "—";

            const netPrice =
              r.netPrice !== null &&
              r.netPrice !== undefined &&
              Number.isFinite(Number(r.netPrice))
                ? Number(r.netPrice).toLocaleString("en-IN")
                : "—";

            return (
              <div
                className="price-card"
                key={r.mandi}
              >
                <div className="price-card__mandi">
                  {r.mandi}
                </div>

                <div className="price-card__price">
                  ₹{formattedPrice}
                </div>

                <div
                  className={
                    "price-card__trend price-card__trend--" +
                    (r.trend || "steady")
                  }
                >
                  {r.trend === "up"
                    ? "▲ rising"
                    : r.trend === "down"
                    ? "▼ falling"
                    : "— steady"}
                </div>

                {r.distanceKm !== null &&
                  r.distanceKm !== undefined && (
                    <div className="price-card__distance">
                      {r.distanceKm} km · net ₹{netPrice}
                    </div>
                  )}

                {r.recordedDate && (
                  <div className="price-card__distance">
                    Updated:{" "}
                    {new Date(
                      r.recordedDate
                    ).toLocaleDateString("en-IN")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

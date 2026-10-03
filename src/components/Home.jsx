
import React, { useState } from "react";
import { api } from "../api";
import MakeOfferButton from "./MakeOfferButton";
import VoiceInput from "./VoiceInput";
import { useI18n } from "../i18n";

const CROPS = ["Onion", "Tomato", "Wheat"];

function Sparkline({ history, forecast }) {
  const allPoints = [...history.map((h) => h.price), ...forecast.map((f) => f.price)];
  const min = Math.min(...allPoints);
  const max = Math.max(...allPoints);
  const range = max - min || 1;
  const w = 280;
  const h = 70;
  const totalPoints = history.length + forecast.length;
  const stepX = w / (totalPoints - 1 || 1);

  const toXY = (val, i) => [i * stepX, h - ((val - min) / range) * h];

  const historyPath = history
    .map((p, i) => toXY(p.price, i))
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");

  const forecastStart = history.length - 1;

  const forecastPath = forecast
    .map((p, i) => toXY(p.price, forecastStart + i + 1))
    .map(([x, y], i) =>
      i === 0
        ? `M${toXY(history[forecastStart].price, forecastStart).join(",")} L${x},${y}`
        : `L${x},${y}`
    )
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="sparkline"
      preserveAspectRatio="none"
    >
      <path d={historyPath} fill="none" stroke="#1F7A3D" strokeWidth="2" />
      <path
        d={forecastPath}
        fill="none"
        stroke="#c98a2c"
        strokeWidth="2"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

export default function Home({ user }) {
  const { t } = useI18n();

  const [crop, setCrop] = useState(user.crop || CROPS[0]);
  const [quantity, setQuantity] = useState(10);
  const [priceRows, setPriceRows] = useState([]);
  const [best, setBest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [bestMatch, setBestMatch] = useState(null);
  const [logistics, setLogistics] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFarmer = user.role === "farmer";

  async function checkPrices() {
    setLoading(true);
    setError("");

    try {
      const [priceData, matchData] = await Promise.all([
        api.comparePrices(crop, user.lat, user.lng),
        api.getMatches(crop),
      ]);

      setPriceRows(priceData.rows || []);
      setBest(priceData.best || null);
      setMatches(matchData.matches || []);
      setBestMatch(matchData.best || null);

      const referenceDistance =
        priceData.best?.distanceKm ?? matchData.best?.distanceKm;

      if (referenceDistance != null) {
        const logisticsData = await api.getLogistics(
          referenceDistance,
          user.lat,
          user.lng,
          crop
        );
        setLogistics(logisticsData);
      } else {
        setLogistics(null);
      }

      if (priceData.best?.mandi) {
        const forecastData = await api
          .getForecast(crop, priceData.best.mandi)
          .catch(() => null);

        setForecast(
          forecastData && forecastData.forecast?.length
            ? forecastData
            : null
        );
      } else {
        setForecast(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      <div className="home__header">
        <div>
          <h1>Crop Price Comparison</h1>
          <p className="home__subhead">
            Find the best market, compare prices, and connect with the right
            buyer.
          </p>
        </div>

        <div className="home__location-chip">
          {user.location || "Set your location"}
        </div>
      </div>

      <div className="home__search-bar">
        <label className="home__field">
          <span>{t("crop")}</span>

          <div className="home__field-with-voice">
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

            <VoiceInput
              onResult={(transcript) => {
                const spoken = transcript.toLowerCase();

                const matched = CROPS.find((c) =>
                  spoken.includes(c.toLowerCase())
                );

                if (matched) {
                  setCrop(matched);
                } else {
                  alert(`Didn't catch a known crop in: "${transcript}"`);
                }
              }}
            />
          </div>
        </label>

        <label className="home__field">
          <span>{t("quantity")}</span>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>

        <label className="home__field home__field--wide">
          <span>{t("location")}</span>

          <input
            type="text"
            value={user.location || ""}
            readOnly
          />
        </label>

        <button
          className="home__check-btn"
          onClick={checkPrices}
          disabled={loading}
        >
          {loading ? "Checking..." : t("checkPrices")}
        </button>
      </div>

      {error && <div className="home__error">{error}</div>}

      <div className="home__grid">
        <section className="home__panel">
          <h2>{t("marketPriceComparison")}</h2>

          {priceRows.length === 0 ? (
            <div className="home__empty">
              Run "Check Prices" to compare mandis near you.
            </div>
          ) : (
            <table className="home__table">
              <thead>
                <tr>
                  <th>Market / Mandi</th>
                  <th>Price (₹/Quintal)</th>
                  <th>Distance</th>
                  <th>Transport Cost</th>
                  <th>Net Price</th>
                </tr>
              </thead>

              <tbody>
                {priceRows.map((r) => (
                  <tr
                    key={r.mandi}
                    className={
                      best && r.mandi === best.mandi
                        ? "home__row--best"
                        : ""
                    }
                  >
                    <td>{r.mandi}</td>

                    <td>
                      ₹{r.price.toLocaleString("en-IN")}
                    </td>

                    <td>
                      {r.distanceKm != null
                        ? `${r.distanceKm} km`
                        : "—"}
                    </td>

                    <td>
                      {r.transportCost != null
                        ? `₹${r.transportCost}`
                        : "—"}
                    </td>

                    <td className="home__net-price">
                      {r.netPrice != null
                        ? `₹${r.netPrice.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="home__panel">
          <h2>
            {isFarmer
              ? t("recommendedBuyers")
              : t("recommendedFarmers")}
          </h2>

          {matches.length === 0 ? (
            <div className="home__empty">
              No matches yet — run a price check first.
            </div>
          ) : (
            <div className="home__match-list">
              {matches.map((m) => (
                <div className="match-card" key={m.listingId}>
                  <div className="match-card__avatar">
                    {m.name.charAt(0)}
                  </div>

                  <div className="match-card__body">
                    <div className="match-card__name">
                      {m.name}

                      {m.isVerified && (
                        <span
                          className="verified-badge"
                          title="Verified account"
                        >
                          ✅
                        </span>
                      )}
                    </div>

                    <div className="match-card__meta">
                      {m.qualityGrade} · {m.quantity} qtl{" "}
                      {isFarmer ? "needed" : "available"}
                    </div>

                    <div className="match-card__price">
                      ₹{m.price.toLocaleString("en-IN")}/quintal
                    </div>
                  </div>

                  <div className="match-card__actions">
                    <a
                      className="match-card__contact"
                      href={`tel:${m.phone}`}
                    >
                      {t("contact")}
                    </a>

                    <MakeOfferButton
                      listingId={m.listingId}
                      suggestedPrice={m.price}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {forecast && (
        <section className="home__panel home__panel--forecast">
          <h2>
            Price Trend &amp; Forecast — {forecast.mandi}
          </h2>

          <div className="forecast-row">
            <Sparkline
              history={forecast.history}
              forecast={forecast.forecast}
            />

            <div
              className={`forecast-callout forecast-callout--${forecast.recommendation}`}
            >
              <div className="forecast-callout__title">
                {forecast.recommendation === "hold" &&
                  "Suggested: Hold a few days"}

                {forecast.recommendation === "sell-now" &&
                  "Suggested: Sell now"}

                {forecast.recommendation === "neutral" &&
                  "Price expected to stay steady"}
              </div>

              <div className="forecast-callout__desc">
                {forecast.reasoning}
              </div>
            </div>
          </div>
        </section>
      )}

      {logistics && (
        <section className="home__panel home__panel--logistics">
          <h2>Logistics &amp; Storage</h2>

          <div className="logistics-grid">
            <div>
              <div className="logistics-subhead">
                Transport options (estimated)
              </div>

              <div className="logistics-list">
                {logistics.transportOptions.map((t) => (
                  <div className="logistics-item" key={t.mode}>
                    <div className="logistics-item__title">
                      {t.mode}
                    </div>

                    <div className="logistics-item__desc">
                      {t.description}
                    </div>

                    <div className="logistics-item__cost">
                      ₹{t.estimatedCost.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="logistics-subhead">
                Nearby storage (if you choose to hold)
              </div>

              <div className="logistics-list">
                {logistics.storageOptions.map((s) => (
                  <div className="logistics-item" key={s.name}>
                    <div className="logistics-item__title">
                      {s.name}
                    </div>

                    <div className="logistics-item__desc">
                      {s.location}
                      {s.distanceKm != null &&
                        ` · ${s.distanceKm} km away`}
                    </div>

                    <div className="logistics-item__cost">
                      ₹{s.ratePerQuintalPerDay}/quintal/day
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {bestMatch && (
        <div className="home__best-option">
          <div className="home__best-icon">★</div>

          <div>
            <div className="home__best-label">
              Best option to {isFarmer ? "sell to" : "buy from"} — combined
              price, distance &amp; reliability
            </div>

            <div className="home__best-name">
              {bestMatch.name} — ₹
              {bestMatch.price.toLocaleString("en-IN")}/quintal
              {bestMatch.distanceKm != null &&
                `, ${bestMatch.distanceKm} km away`}
              , {bestMatch.rating}★ ({bestMatch.completedDeals} deals)
            </div>
          </div>

          <a
            className="home__best-contact"
            href={`tel:${bestMatch.phone}`}
          >
            Contact now
          </a>
        </div>
      )}

      <div className="home__note">
        Trend forecast is a simple statistical projection from recent prices
        — it recommends, it doesn't decide. Final price, quality, and sale
        confirmation stay with you. Prices are illustrative and may vary
        daily. Distance and transport cost are estimated from your location.
      </div>
    </div>
  );
}
```

After replacing `Home.jsx`, **commit it to `main`**. Vercel should automatically build the new commit.

This fixes the literal escaped symbols in the Home page, including **Buyers Near You, market prices, transport, storage, and best-match prices**.

Once Vercel finishes, check the page again.

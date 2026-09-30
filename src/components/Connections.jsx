import React, { useEffect, useState } from "react";
import { api } from "../api";
import MakeOfferButton from "./MakeOfferButton";

export default function Connections({ user }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFarmer = user.role === "farmer";

  useEffect(() => {
    api.getMatches(user.crop || "Onion")
      .then((data) => setMatches(data.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel-page">
      <div className="panel-page__header">
        <h1>{isFarmer ? "Buyers near you" : "Farmers near you"}</h1>
      </div>

      {loading ? (
        <div className="home__empty">Loading\u2026</div>
      ) : matches.length === 0 ? (
        <div className="home__empty">No {isFarmer ? "buyers" : "farmers"} found for your crop yet.</div>
      ) : (
        <div className="home__match-list home__match-list--full">
          {matches.map((m) => (
            <div className="match-card match-card--wide" key={m.listingId}>
              <div className="match-card__avatar">{m.name.charAt(0)}</div>
              <div className="match-card__body">
                <div className="match-card__name">{m.name}{m.isVerified && <span className="verified-badge" title="Verified account">\u2705</span>}</div>
                <div className="match-card__meta">
                  {m.crop} \u00b7 {m.qualityGrade} \u00b7 {m.quantity} qtl {isFarmer ? "needed" : "available"}
                </div>
                <div className="match-card__meta">{m.location} {m.distanceKm != null && `\u00b7 ${m.distanceKm} km away`}</div>
                <div className="match-card__meta">{m.rating}\u2605 \u00b7 {m.completedDeals} completed deals</div>
              </div>
              <div className="match-card__right">
                <div className="match-card__price">\u20b9{m.price.toLocaleString("en-IN")}/quintal</div>
                <a className="match-card__contact" href={`tel:${m.phone}`}>Contact</a>
                <MakeOfferButton listingId={m.listingId} suggestedPrice={m.price} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

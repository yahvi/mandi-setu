import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Schemes() {
  const [query, setQuery] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.searchSchemes("").then(setSchemes).catch(() => setSchemes([])).finally(() => setLoading(false));
    api.recommendedSchemes().then(setRecommended).catch(() => setRecommended(null));
  }, []);

  async function search() {
    setLoading(true);
    try {
      setSchemes(await api.searchSchemes(query));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel-page">
      <div className="panel-page__header"><h1>Government Schemes</h1></div>
      <div className="info-card__disclaimer" style={{ marginBottom: 16 }}>
        Static reference data \u2014 verify current details on the official site linked in each card before relying on it.
      </div>

      {recommended && (
        <>
          <h3 className="admin-section-title">
            Recommended for you {recommended.method === "llm" ? "(AI-matched)" : "(rule-based match)"}
          </h3>
          <div className="scheme-grid">
            {recommended.recommendations.map((s) => (
              <SchemeCard key={s.id} scheme={s} whyRelevant={s.whyRelevant} />
            ))}
          </div>
        </>
      )}

      <h3 className="admin-section-title">Search all schemes</h3>
      <div className="home__search-bar" style={{ marginBottom: 16 }}>
        <label className="home__field home__field--wide">
          <span>Keyword</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. storage, FPO, price" />
        </label>
        <button className="home__check-btn" onClick={search}>Search</button>
      </div>

      {loading ? (
        <div className="home__empty">Loading\u2026</div>
      ) : (
        <div className="scheme-grid">
          {schemes.map((s) => <SchemeCard key={s.id} scheme={s} />)}
        </div>
      )}
    </div>
  );
}

function SchemeCard({ scheme, whyRelevant }) {
  return (
    <div className="scheme-card">
      <div className="scheme-card__level">{scheme.level === "central" ? "Central" : "State (Maharashtra)"}</div>
      <div className="scheme-card__name">{scheme.name}</div>
      {whyRelevant && <div className="scheme-card__why">{whyRelevant}</div>}
      <div className="scheme-card__row"><strong>Eligibility:</strong> {scheme.eligibility}</div>
      <div className="scheme-card__row"><strong>Benefit:</strong> {scheme.benefit}</div>
      <div className="scheme-card__row"><strong>How to apply:</strong> {scheme.application_process}</div>
      <div className="scheme-card__row"><strong>Documents:</strong> {scheme.required_documents}</div>
      <a href={scheme.official_url} target="_blank" rel="noreferrer" className="ghost-btn scheme-card__link">
        Official site
      </a>
    </div>
  );
}

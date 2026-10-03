```jsx
import React, { useEffect, useState } from "react";
import { api } from "../api";
import QualityGrader from "./QualityGrader";

export default function MyListings({ user }) {
  const [listing, setListing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseInfo, setParseInfo] = useState(null);

  const isFarmer = user.role === "farmer";

  useEffect(() => {
    api
      .myListing()
      .then((rows) => {
        const first = rows[0] || null;
        setListing(first);
        setForm(first);
      })
      .catch(() => setListing(null));
  }, []);

  async function handleParse() {
    if (!freeText.trim()) return;

    setParsing(true);
    setParseInfo(null);

    try {
      const parsed = await api.parseRequirement(freeText);

      setForm((f) => ({
        ...f,
        quantity: parsed.quantity ?? f.quantity,
        price: parsed.price ?? f.price,
        target_date: parsed.deadline ?? f.target_date,
      }));

      setParseInfo(parsed);
    } catch (err) {
      alert(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!listing) return;

    setSaving(true);

    try {
      const updated = await api.updateListing(listing.id, {
        quantity: form.quantity,
        qualityGrade: form.quality_grade,
        price: form.price,
        targetDate: form.target_date,
      });

      setListing(updated);
      setForm(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="panel-page">
      <div className="panel-page__header">
        <h1>{isFarmer ? "My Listing" : "My Requirement"}</h1>
      </div>

      {!listing ? (
        <div className="home__empty">
          You haven't posted a{" "}
          {isFarmer ? "crop listing" : "requirement"} yet.
        </div>
      ) : (
        <div className="listing-form">
          <div className="llm-parser">
            <label>
              <span>
                Describe what you {isFarmer ? "have" : "need"} in your own
                words
              </span>

              <textarea
                rows={2}
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={
                  isFarmer
                    ? "e.g. I have about 40 quintals of onion, looking for ₹1800 per quintal, ready by 2026-10-15"
                    : "e.g. Need 50 quintals of onion, can pay up to ₹1820 per quintal, by 2026-10-08"
                }
              />
            </label>

            <button
              type="button"
              className="ghost-btn"
              onClick={handleParse}
              disabled={parsing}
            >
              {parsing ? "Parsing…" : "Auto-fill from text"}
            </button>

            {parseInfo && (
              <div className="llm-parser__result">
                Parsed via{" "}
                {parseInfo.method === "llm"
                  ? "AI (OpenAI)"
                  : "keyword fallback (no OpenAI key set)"}{" "}
                — filled quantity/price/date below. Review before saving.
              </div>
            )}
          </div>

          <label>
            <span>Crop</span>
            <input value={form.crop} disabled />
          </label>

          <label>
            <span>Quantity (quintal)</span>
            <input
              type="number"
              value={form.quantity || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: e.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Quality grade</span>
            <input
              value={form.quality_grade || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  quality_grade: e.target.value,
                })
              }
            />
          </label>

          <QualityGrader
            onGraded={(grade) =>
              setForm({
                ...form,
                quality_grade: grade,
              })
            }
          />

          <label>
            <span>
              {isFarmer ? "Expected price" : "Offered price"} (₹/quintal)
            </span>

            <input
              type="number"
              value={form.price || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value,
                })
              }
            />
          </label>

          <label>
            <span>{isFarmer ? "Ready by" : "Needed by"}</span>

            <input
              type="date"
              value={
                form.target_date
                  ? form.target_date.slice(0, 10)
                  : ""
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  target_date: e.target.value,
                })
              }
            />
          </label>

          <button
            className="home__check-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
}
```

**Important:** this version contains actual `₹` characters, not the literal `\u20b9`.

After replacing it, search GitHub again for **`\u20b9`**. If it returns **0 results**, then we can do the final deployment.

import React, { useState } from "react";
import { api } from "../api";

export default function MakeOfferButton({ listingId, suggestedPrice }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(suggestedPrice || "");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (sent) return <span className="offer-sent-tag">Offer sent</span>;

  if (!open) {
    return (
      <button className="ghost-btn" onClick={() => setOpen(true)}>Make Offer</button>
    );
  }

  async function submit() {
    if (!price) return;
    setBusy(true);
    try {
      await api.makeOffer(listingId, price);
      setSent(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="offer-inline">
      <input
        type="number"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="\u20b9/quintal"
      />
      <button className="ghost-btn" onClick={submit} disabled={busy}>
        {busy ? "Sending\u2026" : "Send"}
      </button>
    </div>
  );
}

```jsx
import React, { useState } from "react";
import { api } from "../api";

export default function MakeOfferButton({ listingId, suggestedPrice }) {
  const [price, setPrice] = useState(suggestedPrice || "");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!price || Number(price) <= 0) {
      alert("Please enter a valid offer price.");
      return;
    }

    setBusy(true);

    try {
      await api.makeOffer(listingId, Number(price));
      alert("Offer sent successfully.");
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="make-offer">
      <input
        type="number"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="₹/quintal"
      />

      <button
        className="ghost-btn"
        onClick={submit}
        disabled={busy}
      >
        {busy ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
```

This removes both literal escapes:

* `\u20b9` → `₹`
* `\u2026` → `…`

Now search GitHub for **`\u20b9`** again. If there are more files, send me the results and we'll clear them all before deploying.


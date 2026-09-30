import React from "react";

const SECTIONS = [
  {
    title: "Home",
    items: [
      ["Check Prices", "Pick your crop and quantity, and pull live prices from every mandi carrying it near you."],
      ["Market Prices Comparison table", "Shows each mandi's price, distance, estimated transport cost, and net price (price minus transport) \u2014 sorted so the best real deal is on top."],
      ["Recommended Buyers/Farmers panel", "Ranked matches using a combined score: 45% price fit, 30% reliability rating, 25% distance."],
      ["Price Trend & Forecast", "A short-term trend line from recent prices, with a plain-language sell-now or hold suggestion and the reasoning behind it."],
      ["Logistics & Storage", "Estimated cost for different transport modes for this distance, plus nearby storage facilities if you'd rather hold than sell immediately."],
      ["Best Option callout", "The single top pick combining everything above, with a one-tap call button."],
    ],
  },
  {
    title: "Market Prices",
    items: [["Price cards", "A fuller view of prices and trend direction (rising / falling / steady) across mandis for one crop at a time."]],
  },
  {
    title: "Buyers / Farmers",
    items: [["Full ranked list", "Every matched counterparty for your crop, with quality grade, quantity, distance, rating, and completed-deal count \u2014 not just the top few shown on Home."]],
  },
  {
    title: "My Listings",
    items: [["Edit your listing", "Update the quantity, quality grade, price, and ready-by/needed-by date on your own posted crop or requirement at any time."]],
  },
  {
    title: "Offers & Payments",
    items: [
      ["Make Offer", "Available on any match card \u2014 propose a price on someone else's listing."],
      ["Accept / Reject", "The recipient of an offer can accept or reject it."],
      ["Pay Now", "Once accepted, the offer-maker pays through a real Razorpay checkout \u2014 a genuine payment gateway integration, not a simulated button."],
      ["Mark as Delivered", "After payment, either party marks the produce as delivered, completing the deal."],
      ["Raise Dispute", "Available on paid or delivered offers if something went wrong \u2014 sends the issue to an admin for review."],
      ["Leave Feedback", "Once an offer is delivered, rate the deal 1\u20135 stars with an optional comment. This is real, user-submitted feedback \u2014 it recalculates the other party's average rating shown on match cards, replacing the placeholder demo number."],
    ],
  },
  {
    title: "Documents",
    items: [
      ["Upload a photo", "Land record, ID proof, or scheme notice \u2014 processed with real OCR (Tesseract.js) to pull out the text."],
      ["Parsed fields", "A simple pattern match on the OCR text tries to pull out a survey/gat number, area, and name. Works best on clear, well-lit scans."],
    ],
  },
  {
    title: "Schemes",
    items: [
      ["Recommended for you", "Schemes matched to your role and situation \u2014 uses an AI model when an OpenAI key is configured, otherwise a simpler rule-based match."],
      ["Search", "Keyword search across the full reference list of central and Maharashtra state schemes, with eligibility, benefits, and how to apply."],
    ],
  },
  {
    title: "Describe what you need (on My Listings)",
    items: [["Auto-fill from text", "Type your requirement in plain language and it extracts quantity, price, and date \u2014 uses an AI model (OpenAI) when configured, otherwise a keyword-based extractor."]],
  },
  {
    title: "Admin (admin accounts only)",
    items: [
      ["Verify users", "Mark a farmer or vendor account as verified \u2014 shows as a badge on their match cards."],
      ["Platform stats", "Counts of farmers, vendors, active listings, and open disputes."],
      ["Resolve disputes", "Review a raised dispute and mark it resolved or rejected, with a note."],
    ],
  },
  {
    title: "Alerts",
    items: [["Notifications", "Price movements and new matching requests relevant to you. Tap one to mark it read."]],
  },
  {
    title: "Profile",
    items: [["Account details", "Your name, role, contact info, and location as stored on your account."]],
  },
];

export default function Guide() {
  return (
    <div className="panel-page">
      <div className="panel-page__header"><h1>Guide</h1></div>
      <div className="guide-list">
        {SECTIONS.map((s) => (
          <div className="guide-section" key={s.title}>
            <h3>{s.title}</h3>
            {s.items.map(([label, desc]) => (
              <div className="guide-item" key={label}>
                <div className="guide-item__label">{label}</div>
                <div className="guide-item__desc">{desc}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";

export default function About() {
  return (
    <div className="panel-page">
      <div className="panel-page__header"><h1>About Mandi Setu</h1></div>

      <div className="info-card">
        <p>
          Mandi Setu is a digital market linkage and price discovery platform that connects farmers
          directly with verified buyers. It was built for Smart India Hackathon 2026, Problem Statement
          SIH26132 \u2014 "Strengthening market linkages and price discovery for farmers."
        </p>

        <h3>The problem</h3>
        <p>
          Most farmers sell to whichever local trader is available right after harvest, often realising
          only a third of the final consumer price, because they lack real-time visibility into prices
          across nearby mandis, which buyers are actively looking for their crop, and whether current
          conditions favour selling now or holding a few days.
        </p>

        <h3>What Mandi Setu does</h3>
        <ul>
          <li><strong>Price comparison:</strong> live mandi prices, transport cost, and net price side by side, so the actual best market is obvious \u2014 not just the highest sticker price.</li>
          <li><strong>Buyer/farmer matching:</strong> a combined score (price fit, distance, reliability rating) ranks the best counterparties, instead of a random list.</li>
          <li><strong>Price trend forecast:</strong> a short-term trend projection suggests whether to sell now or hold, based on recent price history.</li>
          <li><strong>Logistics &amp; storage:</strong> estimated transport costs by mode, and nearby storage options if holding produce is the better call.</li>
          <li><strong>Digital offers, real payments &amp; disputes:</strong> negotiate, pay through an actual Razorpay checkout, track delivery, and raise a dispute if something goes wrong.</li>
          <li><strong>Document OCR:</strong> upload a land record, ID, or scheme notice and get real extracted text (Tesseract.js), with simple structured-field parsing.</li>
          <li><strong>Government schemes:</strong> searchable reference data on relevant central and Maharashtra state schemes, with a personalized "recommended for you" list.</li>
          <li><strong>Requirement understanding:</strong> describe what you need in plain language and have it parsed into quantity, price, and date.</li>
          <li><strong>Multilingual + voice:</strong> English/Hindi/Marathi toggle and voice input on the main screens (voice needs Chrome or Edge).</li>
          <li><strong>Admin oversight:</strong> verify accounts, monitor platform activity, and resolve grievances.</li>
        </ul>

        <h3>Who it's for</h3>
        <p>
          Farmers and Farmer Producer Organizations (FPOs) looking for better prices and less dependence
          on a single local intermediary, and vendors/traders looking to source verified, quality-graded
          produce reliably.
        </p>

        <div className="info-card__disclaimer">
          Mandi Setu recommends; it doesn't decide. All AI-assisted suggestions \u2014 price forecasts and
          matches \u2014 are inputs to your decision, not a replacement for your own judgment or mandi-level
          verification.
        </div>
      </div>
    </div>
  );
}

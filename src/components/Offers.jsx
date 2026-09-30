import React, { useEffect, useState } from "react";
import { api } from "../api";

const STATUS_LABEL = {
  pending: "Pending",
  accepted: "Accepted \u2014 payment due",
  paid: "Paid",
  delivered: "Delivered",
  rejected: "Rejected",
};

// Only non-payment status transitions are simple buttons; "accepted" -> "paid"
// goes through the real Razorpay flow below instead.
const NEXT_ACTIONS = {
  pending: [{ status: "accepted", label: "Accept" }, { status: "rejected", label: "Reject" }],
  accepted: [],
  paid: [{ status: "delivered", label: "Mark as Delivered" }],
  delivered: [],
  rejected: [],
};

let razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (razorpayScriptPromise) return razorpayScriptPromise;
  razorpayScriptPromise = new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load Razorpay checkout script"));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

function FeedbackControl({ offer }) {
  const [existing, setExisting] = useState(undefined); // undefined = loading, null = none yet
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.reviewForOffer(offer.id).then(setExisting).catch(() => setExisting(null));
  }, [offer.id]);

  if (existing === undefined) return null;

  if (existing) {
    return (
      <div className="feedback-given">
        Your feedback: {"\u2605".repeat(existing.rating)}{"\u2606".repeat(5 - existing.rating)}
        {existing.comment && <span className="feedback-given__comment"> \u2014 "{existing.comment}"</span>}
      </div>
    );
  }

  if (!open) {
    return <button className="ghost-btn" onClick={() => setOpen(true)}>Leave Feedback</button>;
  }

  async function submit() {
    setSubmitting(true);
    try {
      await api.submitReview(offer.id, rating, comment);
      setExisting({ rating, comment });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="feedback-form">
      <div className="feedback-form__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={n <= rating ? "star-btn star-btn--filled" : "star-btn"}
            onClick={() => setRating(n)}
          >
            {"\u2605"}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="ghost-btn ghost-btn--primary" onClick={submit} disabled={submitting}>
        {submitting ? "Saving\u2026" : "Submit"}
      </button>
    </div>
  );
}

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api.myOffers().then(setOffers).catch(() => setOffers([])).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function raiseDispute(offer) {
    const reason = prompt("Briefly describe the issue with this deal:");
    if (!reason) return;
    try {
      await api.raiseDispute(offer.id, reason);
      alert("Dispute raised. An admin will review it.");
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function advance(id, status) {
    setBusyId(id);
    try {
      await api.updateOfferStatus(id, status);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function payNow(offer) {
    setBusyId(offer.id);
    try {
      await loadRazorpayScript();
      const order = await api.createPaymentOrder(offer.id);

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Mandi Setu",
        description: `${offer.crop} \u2014 \u20b9${offer.offerPrice}/quintal`,
        handler: async (response) => {
          try {
            await api.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            load();
          } catch (err) {
            alert("Payment succeeded but verification failed: " + err.message);
          }
        },
        modal: { ondismiss: () => setBusyId(null) },
        theme: { color: "#2D6CDF" },
      });
      rzp.open();
    } catch (err) {
      alert(err.message);
      setBusyId(null);
    }
  }

  return (
    <div className="panel-page">
      <div className="panel-page__header"><h1>Offers &amp; Payments</h1></div>

      {loading ? (
        <div className="home__empty">Loading\u2026</div>
      ) : offers.length === 0 ? (
        <div className="home__empty">No offers yet \u2014 make one from the Buyers/Farmers tab.</div>
      ) : (
        <div className="offer-list">
          {offers.map((o) => (
            <div className="offer-card" key={o.id}>
              <div className="offer-card__main">
                <div className="offer-card__title">
                  {o.crop} \u00b7 {o.qualityGrade} \u00b7 \u20b9{o.offerPrice.toLocaleString("en-IN")}/quintal
                </div>
                <div className="offer-card__meta">
                  {o.direction === "sent" ? "You offered " : "Offer from "}
                  <strong>{o.counterparty.name}</strong>
                  {o.counterparty.phone && ` \u00b7 ${o.counterparty.phone}`}
                </div>
              </div>
              <div className={`offer-card__status offer-card__status--${o.status}`}>
                {STATUS_LABEL[o.status]}
              </div>
              <div className="offer-card__actions">
                {o.status === "accepted" && o.direction === "sent" && (
                  <button className="ghost-btn ghost-btn--primary" disabled={busyId === o.id} onClick={() => payNow(o)}>
                    {busyId === o.id ? "Opening\u2026" : "Pay Now"}
                  </button>
                )}
                {(NEXT_ACTIONS[o.status] || []).map((a) => (
                  <button
                    key={a.status}
                    className="ghost-btn"
                    disabled={busyId === o.id}
                    onClick={() => advance(o.id, a.status)}
                  >
                    {a.label}
                  </button>
                ))}
                {(o.status === "paid" || o.status === "delivered") && (
                  <button className="ghost-btn ghost-btn--danger" onClick={() => raiseDispute(o)}>
                    Raise Dispute
                  </button>
                )}
                {o.status === "delivered" && <FeedbackControl offer={o} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

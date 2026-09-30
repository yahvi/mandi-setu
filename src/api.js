const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = localStorage.getItem("mandi_setu_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  comparePrices: (crop, lat, lng) => {
    const params = new URLSearchParams({ crop, ...(lat && lng ? { lat, lng } : {}) });
    return request(`/prices/compare?${params.toString()}`);
  },

  getForecast: (crop, mandi) => request(`/prices/forecast?${new URLSearchParams({ crop, mandi })}`),

  getMatches: (crop) => request(`/matches?${new URLSearchParams({ crop })}`),

  createListing: (payload) => request("/listings", { method: "POST", body: JSON.stringify(payload) }),
  myListing: () => request("/listings/mine"),
  updateListing: (id, payload) => request(`/listings/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  getLogistics: (distanceKm, lat, lng, crop) => {
    const params = new URLSearchParams({
      distanceKm,
      ...(lat && lng ? { lat, lng } : {}),
      ...(crop ? { crop } : {}),
    });
    return request(`/logistics?${params.toString()}`);
  },

  getAlerts: () => request("/alerts"),
  markAlertRead: (id) => request(`/alerts/${id}/read`, { method: "PATCH" }),

  makeOffer: (listingId, offerPrice) => request("/offers", { method: "POST", body: JSON.stringify({ listingId, offerPrice }) }),
  myOffers: () => request("/offers/mine"),
  updateOfferStatus: (id, status) => request(`/offers/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),

  createPaymentOrder: (offerId) => request("/payments/create-order", { method: "POST", body: JSON.stringify({ offerId }) }),
  verifyPayment: (payload) => request("/payments/verify", { method: "POST", body: JSON.stringify(payload) }),

  // Admin
  adminUsers: () => request("/admin/users"),
  adminVerifyUser: (id) => request(`/admin/users/${id}/verify`, { method: "PATCH" }),
  adminStats: () => request("/admin/stats"),
  adminDisputes: () => request("/admin/disputes"),
  adminResolveDispute: (id, status, resolutionNote) =>
    request(`/admin/disputes/${id}`, { method: "PATCH", body: JSON.stringify({ status, resolutionNote }) }),

  // Disputes
  raiseDispute: (offerId, reason) => request("/disputes", { method: "POST", body: JSON.stringify({ offerId, reason }) }),
  myDisputes: () => request("/disputes/mine"),

  submitReview: (offerId, rating, comment) => request("/reviews", { method: "POST", body: JSON.stringify({ offerId, rating, comment }) }),
  reviewForOffer: (offerId) => request(`/reviews/for-offer/${offerId}`),

  // Government schemes
  searchSchemes: (query) => request(`/schemes${query ? `?query=${encodeURIComponent(query)}` : ""}`),
  recommendedSchemes: () => request("/schemes/recommend"),

  // LLM requirement parsing
  parseRequirement: (text) => request("/llm/parse-requirement", { method: "POST", body: JSON.stringify({ text }) }),

  // Documents (OCR)
  uploadDocument: (docType, fileName, imageBase64) =>
    request("/documents/upload", { method: "POST", body: JSON.stringify({ docType, fileName, imageBase64 }) }),
  myDocuments: () => request("/documents/mine"),
};

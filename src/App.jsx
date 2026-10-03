import React, { useState } from "react";
import "./App.css";
import { api } from "./api";
import { I18nProvider, useI18n, LANGUAGES } from "./i18n";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import MarketPrices from "./components/MarketPrices";
import Connections from "./components/Connections";
import MyListings from "./components/MyListings";
import Offers from "./components/Offers";
import Admin from "./components/Admin";
import Schemes from "./components/Schemes";
import Documents from "./components/Documents";
import About from "./components/About";
import Guide from "./components/Guide";
import { Alerts, Profile } from "./components/Misc";

const CROPS = ["Wheat", "Rice", "Onion", "Tomato", "Cotton", "Soybean", "Sugarcane", "Maize", "Potato", "Groundnut"];

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidMobile = (v) => /^[6-9]\d{9}$/.test((v || "").replace(/\D/g, "").slice(-10));

function BrandHeader() {
  const { lang, setLang } = useI18n();
  return (
    <div className="auth-brand">
      <span className="auth-brand__mark">MS</span>
      <div>
        <div className="auth-brand__name">Mandi Setu</div>
        <div className="auth-brand__tag">Direct. Fair. Better.</div>
      </div>
      <select className="lang-select auth-brand__lang" value={lang} onChange={(e) => setLang(e.target.value)}>
        {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  );
}

/* ---------------- Role select ---------------- */
function RoleSelect({ onSelect }) {
  const { t } = useI18n();
  return (
    <div className="screen role-screen">
      <BrandHeader />
      <h1>{t("roleQuestion")}</h1>
      <p className="subhead">Your entry decides what the app shows you next \u2014 prices to sell at, or produce to buy.</p>
      <div className="role-grid">
        <button className="role-card role-card--farmer" onClick={() => onSelect("farmer")}>
          <span className="role-card__eyebrow">Grow &amp; sell</span>
          <span className="role-card__title">{t("imFarmer")}</span>
          <span className="role-card__desc">List your crop, see live mandi prices, find buyers nearby.</span>
        </button>
        <button className="role-card role-card--vendor" onClick={() => onSelect("vendor")}>
          <span className="role-card__eyebrow">Source &amp; buy</span>
          <span className="role-card__title">{t("imVendor")}</span>
          <span className="role-card__desc">Post what you need, discover farmers with matching produce.</span>
        </button>
      </div>
    </div>
  );
}

/* ---------------- Auth (signup / login) ---------------- */
function AuthForm({ role, mode, setMode, onAuthed, onBack }) {
  const [form, setForm] = useState({
    fullName: "", address: "", mobile: "", email: "", password: "", confirmPassword: "",
    crop: CROPS[0], quantity: "", price: "", harvestDate: "",
    location: "", contact: "", quantityNeeded: "", deadline: "",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const updateLogin = (key) => (e) => setLoginForm((f) => ({ ...f, [key]: e.target.value }));

  function validateSignup() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name";
    if (role === "farmer" && !form.address.trim()) next.address = "Enter your address";
    if (role === "vendor" && !form.location.trim()) next.location = "Enter your location";
    const contactField = role === "farmer" ? form.mobile : form.contact;
    if (!isValidMobile(contactField)) next.contactField = "Enter a valid 10-digit mobile number";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords don't match";
    if (role === "vendor" && !form.price) next.price = "Enter the price you're willing to offer";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    if (!validateSignup()) return;
    setBusy(true);
    try {
      const payload = {
        role,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: role === "farmer" ? form.mobile : form.contact,
        location: role === "farmer" ? form.address : form.location,
      };
      const { token, user } = await api.signup(payload);
      localStorage.setItem("mandi_setu_token", token);
      onAuthed({ ...user, crop: form.crop, quantity: form.quantity, price: form.price });

      // Create the crop listing / requirement right after signup
      await api.createListing({
        crop: form.crop,
        quantity: role === "farmer" ? form.quantity : form.quantityNeeded,
        qualityGrade: "Standard",
        price: form.price,
        targetDate: role === "farmer" ? form.harvestDate : form.deadline,
      }).catch(() => {});
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!isValidEmail(loginForm.email)) next.email = "Enter a valid email address";
    if (!loginForm.password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const { token, user } = await api.login(loginForm);
      localStorage.setItem("mandi_setu_token", token);
      onAuthed(user);
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen auth-screen">
      <BrandHeader />
      <button className="back-link" onClick={onBack}>&lt; change role</button>
      <div className="role-flag">{role === "farmer" ? "Farmer account" : "Vendor account"}</div>

      <div className="tabs">
        <button className={mode === "signup" ? "tab tab--active" : "tab"} onClick={() => setMode("signup")}>Create account</button>
        <button className={mode === "login" ? "tab tab--active" : "tab"} onClick={() => setMode("login")}>Log in</button>
      </div>

      {errors.form && <div className="home__error">{errors.form}</div>}

      {mode === "signup" ? (
        <form className="form" onSubmit={handleSignupSubmit} noValidate>
          <Field label="Full name" error={errors.fullName}>
            <input value={form.fullName} onChange={update("fullName")} placeholder="e.g. Ramesh Patil" />
          </Field>

          {role === "farmer" ? (
            <Field label="Address" error={errors.address}>
              <input value={form.address} onChange={update("address")} placeholder="Village, Taluka, District" />
            </Field>
          ) : (
            <Field label="Location" error={errors.location}>
              <input value={form.location} onChange={update("location")} placeholder="City / market area" />
            </Field>
          )}

          <div className="field-row">
            <Field label="Mobile number" error={errors.contactField}>
              <input
                value={role === "farmer" ? form.mobile : form.contact}
                onChange={update(role === "farmer" ? "mobile" : "contact")}
                placeholder="10-digit mobile number"
                inputMode="numeric"
              />
            </Field>
            <Field label="Email address" error={errors.email}>
              <input type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" />
            </Field>
          </div>

          <div className="field-row">
            <Field label="Password" error={errors.password}>
              <input type="password" value={form.password} onChange={update("password")} placeholder="At least 6 characters" />
            </Field>
            <Field label="Confirm password" error={errors.confirmPassword}>
              <input type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Re-enter password" />
            </Field>
          </div>

          <hr className="divider" />

          {role === "farmer" ? (
            <>
              <Field label="Crop you're growing">
                <select value={form.crop} onChange={update("crop")}>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="field-row">
                <Field label="Quantity available (quintals)">
                  <input type="number" min="0" value={form.quantity} onChange={update("quantity")} placeholder="e.g. 30" />
                </Field>
                <Field
  label="Price you're willing to offer (₹ / quintal)"
  error={errors.price}
>
                  <input type="number" min="0" value={form.price} onChange={update("price")} placeholder="e.g. 1800" />
                </Field>
              </div>
              <Field label="Expected harvest / ready date">
                <input type="date" value={form.harvestDate} onChange={update("harvestDate")} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Crop you're looking for">
                <select value={form.crop} onChange={update("crop")}>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="field-row">
  <Field
    label="Price you're willing to offer (₹ / quintal)"
    error={errors.price}
  >
    <input
      type="number"
      min="0"
      value={form.price}
      onChange={update("price")}
      placeholder="e.g. 1820"
    />
  </Field>
</div>
              <Field label="Needed by">
                <input type="date" value={form.deadline} onChange={update("deadline")} />
              </Field>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={busy}>
            {busy ? "Creating account\u2026" : "Create account"}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={handleLoginSubmit} noValidate>
          <Field label="Email address" error={errors.email}>
            <input type="email" value={loginForm.email} onChange={updateLogin("email")} placeholder="you@example.com" />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" value={loginForm.password} onChange={updateLogin("password")} placeholder="Your password" />
          </Field>
          <button type="submit" className="submit-btn" disabled={busy}>
            {busy ? "Logging in\u2026" : "Log in"}
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__error">{error}</span>}
    </label>
  );
}

/* ---------------- Dashboard layout (post-login) ---------------- */
function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState(user.role === "admin" ? "admin" : "home");
  const { lang, setLang, t } = useI18n();

  return (
    <div className="app-layout">
      <Sidebar role={user.role} active={tab} onNavigate={setTab} alertCount={2} />
      <div className="app-layout__main">
        <div className="topbar">
          <div className="topbar__spacer" />
          <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <div className="topbar__location">\ud83d\udccd {user.location || "Set location"}</div>
          <div className="topbar__date">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
          <button className="logout-btn" onClick={onLogout}>{t("logout")}</button>
        </div>
        <div className="app-layout__content">
          {tab === "home" && <Home user={user} />}
          {tab === "prices" && <MarketPrices user={user} />}
          {tab === "connections" && <Connections user={user} />}
          {tab === "offers" && <Offers />}
          {tab === "listings" && <MyListings user={user} />}
          {tab === "documents" && <Documents />}
          {tab === "schemes" && <Schemes />}
          {tab === "alerts" && <Alerts />}
          {tab === "profile" && <Profile user={user} />}
          {tab === "guide" && <Guide />}
          {tab === "about" && <About />}
          {tab === "admin" && <Admin />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Root app ---------------- */
export default function App() {
  const [screen, setScreen] = useState("role"); // role | auth | dashboard
  const [role, setRole] = useState(null);
  const [authMode, setAuthMode] = useState("signup");
  const [user, setUser] = useState(null);

  function handleAuthed(u) {
    setUser(u);
    setScreen("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("mandi_setu_token");
    setUser(null);
    setRole(null);
    setScreen("role");
  }

  return (
    <I18nProvider>
      <div className="app-shell">
        {screen === "role" && (
          <RoleSelect onSelect={(r) => { setRole(r); setAuthMode("signup"); setScreen("auth"); }} />
        )}
        {screen === "auth" && (
          <AuthForm role={role} mode={authMode} setMode={setAuthMode} onAuthed={handleAuthed} onBack={() => setScreen("role")} />
        )}
        {screen === "dashboard" && <Dashboard user={user} onLogout={handleLogout} />}
      </div>
    </I18nProvider>
  );
}

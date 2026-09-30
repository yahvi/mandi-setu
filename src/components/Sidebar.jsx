import React from "react";
import { useI18n } from "../i18n";

export default function Sidebar({ role, active, onNavigate, alertCount }) {
  const { t } = useI18n();

  const NAV_ITEMS = role === "admin"
    ? [
        { id: "admin", label: "Admin Dashboard", icon: "\u2699" },
        { id: "schemes", label: "Schemes", icon: "\ud83d\udcdc" },
      ]
    : [
        { id: "home", label: t("navHome"), icon: "\u2302" },
        { id: "prices", label: t("navPrices"), icon: "\u2261" },
        { id: "connections", label: role === "farmer" ? t("navBuyers") : t("navFarmers"), icon: "\u2694" },
        { id: "offers", label: t("navOffers"), icon: "\u26c1" },
        { id: "listings", label: t("navListings"), icon: "\u25A4" },
        { id: "documents", label: "Documents", icon: "\ud83d\udcc4" },
        { id: "schemes", label: "Schemes", icon: "\ud83d\udcdc" },
        { id: "alerts", label: t("navAlerts"), icon: "\u25CF" },
        { id: "profile", label: t("navProfile"), icon: "\u25CB" },
      ];

  const FOOTER_ITEMS = [
    { id: "guide", label: t("navGuide"), icon: "?" },
    { id: "about", label: t("navAbout"), icon: "i" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__leaf">MS</span>
        <div>
          <div className="sidebar__brand-name">Mandi Setu</div>
          <div className="sidebar__brand-tag">{t("appTagline")}</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={active === item.id ? "sidebar__item sidebar__item--active" : "sidebar__item"}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.id === "alerts" && alertCount > 0 && (
              <span className="sidebar__badge">{alertCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        {FOOTER_ITEMS.map((item) => (
          <button
            key={item.id}
            className={active === item.id ? "sidebar__item sidebar__item--active" : "sidebar__item"}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

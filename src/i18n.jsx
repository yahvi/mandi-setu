import React, { createContext, useContext, useState } from "react";

// Covers primary navigation and the main working screens (Home, auth, sidebar).
// Guide/About body text and secondary microcopy stay English-only for now \u2014
// translating every string in the app is a larger effort than this pass covers.
const DICTIONARY = {
  en: {
    appTagline: "Direct. Fair. Better.",
    navHome: "Home",
    navPrices: "Market Prices",
    navBuyers: "Buyers",
    navFarmers: "Farmers",
    navOffers: "Offers & Payments",
    navListings: "My Listings",
    navAlerts: "Alerts",
    navProfile: "Profile",
    navGuide: "Guide",
    navAbout: "About",
    logout: "Log out",
    checkPrices: "Check Prices",
    crop: "Crop",
    quantity: "Quantity (quintal)",
    location: "Location",
    marketPriceComparison: "Market Prices Comparison",
    recommendedBuyers: "Recommended Buyers",
    recommendedFarmers: "Recommended Farmers",
    bestOption: "Best option",
    contact: "Contact",
    makeOffer: "Make Offer",
    createAccount: "Create account",
    login: "Log in",
    fullName: "Full name",
    email: "Email address",
    password: "Password",
    roleQuestion: "Who's opening the ledger today?",
    imFarmer: "I'm a Farmer",
    imVendor: "I'm a Vendor / Buyer",
  },
  hi: {
    appTagline: "\u0938\u0940\u0927\u093e\u0964 \u0928\u094d\u092f\u093e\u092f\u0938\u0902\u0917\u0924\u0964 \u092c\u0947\u0939\u0924\u0930\u0964",
    navHome: "\u0939\u094b\u092e",
    navPrices: "\u092c\u093e\u091c\u093e\u0930 \u092d\u093e\u0935",
    navBuyers: "\u0916\u0930\u0940\u0926\u093e\u0930",
    navFarmers: "\u0915\u093f\u0938\u093e\u0928",
    navOffers: "\u0911\u092b\u0930 \u0914\u0930 \u092d\u0941\u0917\u0924\u093e\u0928",
    navListings: "\u092e\u0947\u0930\u0940 \u0938\u0942\u091a\u0940",
    navAlerts: "\u0938\u0942\u091a\u0928\u093e\u090f\u0902",
    navProfile: "\u092a\u094d\u0930\u094b\u092b\u093c\u093e\u0907\u0932",
    navGuide: "\u0917\u093e\u0907\u0921",
    navAbout: "\u0939\u092e\u093e\u0930\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902",
    logout: "\u0932\u0949\u0917\u0906\u0909\u091f",
    checkPrices: "\u092d\u093e\u0935 \u091c\u093e\u0902\u091a\u0947\u0902",
    crop: "\u092b\u0938\u0932",
    quantity: "\u092e\u093e\u0924\u094d\u0930\u093e (\u0915\u094d\u0935\u093f\u0902\u091f\u0932)",
    location: "\u0938\u094d\u0925\u093e\u0928",
    marketPriceComparison: "\u092c\u093e\u091c\u093e\u0930 \u092d\u093e\u0935 \u0924\u0941\u0932\u0928\u093e",
    recommendedBuyers: "\u0938\u0941\u091d\u093e\u090f \u0917\u090f \u0916\u0930\u0940\u0926\u093e\u0930",
    recommendedFarmers: "\u0938\u0941\u091d\u093e\u090f \u0917\u090f \u0915\u093f\u0938\u093e\u0928",
    bestOption: "\u0938\u0930\u094d\u0935\u0936\u094d\u0930\u0947\u0937\u094d\u0920 \u0935\u093f\u0915\u0932\u094d\u092a",
    contact: "\u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u0947\u0902",
    makeOffer: "\u0911\u092b\u0930 \u092d\u0947\u091c\u0947\u0902",
    createAccount: "\u0916\u093e\u0924\u093e \u092c\u0928\u093e\u090f\u0902",
    login: "\u0932\u0949\u0917\u0907\u0928",
    fullName: "\u092a\u0942\u0930\u093e \u0928\u093e\u092e",
    email: "\u0908\u092e\u0947\u0932",
    password: "\u092a\u093e\u0938\u0935\u0930\u094d\u0921",
    roleQuestion: "\u0906\u091c \u0916\u093e\u0924\u093e \u0915\u094c\u0928 \u0916\u094b\u0932 \u0930\u0939\u093e \u0939\u0948?",
    imFarmer: "\u092e\u0948\u0902 \u090f\u0915 \u0915\u093f\u0938\u093e\u0928 \u0939\u0942\u0902",
    imVendor: "\u092e\u0948\u0902 \u090f\u0915 \u0916\u0930\u0940\u0926\u093e\u0930/\u0935\u093f\u0915\u094d\u0930\u0947\u0924\u093e \u0939\u0942\u0902",
  },
  mr: {
    appTagline: "\u0925\u0947\u091f. \u0928\u094d\u092f\u093e\u092f\u0940. \u091a\u093e\u0902\u0917\u0932\u0947.",
    navHome: "\u0939\u094b\u092e",
    navPrices: "\u092c\u093e\u091c\u093e\u0930 \u092d\u093e\u0935",
    navBuyers: "\u0916\u0930\u0947\u0926\u0940\u0926\u093e\u0930",
    navFarmers: "\u0936\u0947\u0924\u0915\u0930\u0940",
    navOffers: "\u0911\u092b\u0930 \u0906\u0923\u093f \u092a\u0947\u092e\u0947\u0902\u091f",
    navListings: "\u092e\u093e\u091d\u0940 \u092f\u093e\u0926\u0940",
    navAlerts: "\u0938\u0942\u091a\u0928\u093e",
    navProfile: "\u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932",
    navGuide: "\u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u093f\u0915\u093e",
    navAbout: "\u0906\u092e\u091a\u094d\u092f\u093e\u092c\u0926\u094d\u0926\u0932",
    logout: "\u0932\u0949\u0917\u0906\u0909\u091f",
    checkPrices: "\u092d\u093e\u0935 \u0924\u092a\u093e\u0938\u093e",
    crop: "\u092a\u0940\u0915",
    quantity: "\u092a\u094d\u0930\u092e\u093e\u0923 (\u0915\u094d\u0935\u093f\u0902\u0938\u0932)",
    location: "\u0938\u094d\u0925\u093e\u0928",
    marketPriceComparison: "\u092c\u093e\u091c\u093e\u0930 \u092d\u093e\u0935 \u0924\u0941\u0932\u0928\u093e",
    recommendedBuyers: "\u0936\u093f\u092b\u093e\u0930\u0938 \u0915\u0947\u0932\u0947\u0932\u0947 \u0916\u0930\u0947\u0926\u0940\u0926\u093e\u0930",
    recommendedFarmers: "\u0936\u093f\u092b\u093e\u0930\u0938 \u0915\u0947\u0932\u0947\u0932\u0947 \u0936\u0947\u0924\u0915\u0930\u0940",
    bestOption: "\u0938\u0930\u094d\u0935\u094b\u0924\u094d\u0924\u092e \u092a\u0930\u094d\u092f\u093e\u092f",
    contact: "\u0938\u0902\u092a\u0930\u094d\u0915 \u0915\u0930\u093e",
    makeOffer: "\u0911\u092b\u0930 \u0926\u094d\u092f\u093e",
    createAccount: "\u0916\u093e\u062a\u093e \u0924\u092f\u093e\u0930 \u0915\u0930\u093e",
    login: "\u0932\u0949\u0917\u0907\u0928",
    fullName: "\u092a\u0942\u0930\u094d\u0923 \u0928\u093e\u0935",
    email: "\u0908\u092e\u0947\u0932",
    password: "\u092a\u093e\u0938\u0935\u0930\u094d\u0921",
    roleQuestion: "\u0906\u091c \u0916\u093e\u062a\u0947 \u0915\u094b\u0923 \u0909\u0918\u0921\u0924 \u0906\u0939\u0947?",
    imFarmer: "\u092e\u0940 \u0936\u0947\u0924\u0915\u0930\u0940 \u0906\u0939\u0947",
    imVendor: "\u092e\u0940 \u0916\u0930\u0947\u0926\u0940\u0926\u093e\u0930/\u0935\u094d\u092f\u093e\u092a\u093e\u0930\u0940 \u0906\u0939\u0947",
  },
};

// Maps our language codes to BCP-47 tags the browser's speech recognition understands.
export const SPEECH_LANG = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "\u0939\u093f\u0902\u0926\u0940" },
  { code: "mr", label: "\u092e\u0930\u093e\u0920\u0940" },
];

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("mandi_setu_lang") || "en");

  function changeLang(code) {
    setLang(code);
    localStorage.setItem("mandi_setu_lang", code);
  }

  function t(key) {
    return DICTIONARY[lang]?.[key] ?? DICTIONARY.en[key] ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

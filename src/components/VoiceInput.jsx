import React, { useState } from "react";
import { SPEECH_LANG, useI18n } from "../i18n";

const SpeechRecognitionAPI =
  typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

// Note: this only works in Chromium-based browsers (Chrome, Edge). Firefox and
// Safari don't implement the Web Speech recognition API as of this build.
export default function VoiceInput({ onResult }) {
  const { lang } = useI18n();
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(!SpeechRecognitionAPI);

  function startListening() {
    if (!SpeechRecognitionAPI) {
      setUnsupported(true);
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = SPEECH_LANG[lang] || "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.start();
  }

  if (unsupported) {
    return (
      <span className="voice-btn voice-btn--disabled" title="Voice input needs Chrome or Edge">
        {"\u{1F3A4}"}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={listening ? "voice-btn voice-btn--listening" : "voice-btn"}
      onClick={startListening}
      title="Speak instead of typing"
    >
      {listening ? "\u2026" : "\u{1F3A4}"}
    </button>
  );
}

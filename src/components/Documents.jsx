import React, { useEffect, useState } from "react";
import { api } from "../api";

const DOC_TYPES = [
  { value: "land_record", label: "Land record (7/12 extract)" },
  { value: "id_proof", label: "ID proof" },
  { value: "scheme_notice", label: "Scheme notice" },
  { value: "other", label: "Other" },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Documents() {
  const [docType, setDocType] = useState(DOC_TYPES[0].value);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");

  function load() {
    api.myDocuments().then(setDocuments).catch(() => setDocuments([]));
  }
  useEffect(load, []);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  }

  async function upload() {
    if (!file) return;
    setProcessing(true);
    setError("");
    try {
      const base64 = await fileToBase64(file);
      await api.uploadDocument(docType, file.name, base64);
      setFile(null);
      setPreview(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="panel-page">
      <div className="panel-page__header"><h1>Documents</h1></div>
      <div className="info-card__disclaimer" style={{ marginBottom: 16 }}>
        Photos are processed with real OCR (Tesseract.js) to pull out text. Structured-field
        extraction (survey number, area, name) is a simple pattern match on that text \u2014 it works
        best on clear, well-lit scans, not a guaranteed reading of every document.
      </div>

      <div className="listing-form" style={{ marginBottom: 24 }}>
        <label>
          <span>Document type</span>
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {preview && <img src={preview} alt="Preview" style={{ width: 120, borderRadius: 6 }} />}
        {error && <div className="home__error">{error}</div>}
        <button className="home__check-btn" onClick={upload} disabled={!file || processing}>
          {processing ? "Running OCR\u2026" : "Upload & Extract Text"}
        </button>
      </div>

      <h3 className="admin-section-title">Your uploaded documents</h3>
      {documents.length === 0 ? (
        <div className="home__empty">No documents uploaded yet.</div>
      ) : (
        <div className="offer-list">
          {documents.map((d) => (
            <div className="offer-card" key={d.id} style={{ alignItems: "flex-start" }}>
              <div className="offer-card__main">
                <div className="offer-card__title">{d.file_name || d.doc_type}</div>
                <div className="offer-card__meta">Type: {d.doc_type}</div>
                {d.extracted_text && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ cursor: "pointer", fontSize: 12.5, color: "var(--muted)" }}>
                      View extracted text
                    </summary>
                    <pre className="document-ocr-text">{d.extracted_text}</pre>
                  </details>
                )}
                {d.structured_data && (d.structured_data.surveyNumber || d.structured_data.area || d.structured_data.name) && (
                  <div className="offer-card__meta">
                    Parsed: {d.structured_data.name && `Name: ${d.structured_data.name} `}
                    {d.structured_data.surveyNumber && `\u00b7 Survey/Gat No: ${d.structured_data.surveyNumber} `}
                    {d.structured_data.area && `\u00b7 Area: ${d.structured_data.area}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

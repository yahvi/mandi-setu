import React, { useRef, useState } from "react";

// Analyzes actual pixel data from the uploaded photo: average brightness and
// color uniformity (low variance often correlates with even ripeness/color).
// This is a real, working heuristic on real pixel data \u2014 it is NOT a trained
// computer-vision grading model. A genuine quality-grading model would need a
// labeled produce-photo dataset and a CNN (e.g. MobileNetV2 transfer learning),
// which is documented as future scope, not built here.
function analyzeImage(imageEl) {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 120);
  const h = (canvas.height = 120);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageEl, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  let sum = 0, sumSq = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    sum += brightness;
    sumSq += brightness * brightness;
    count++;
  }
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  const uniformity = Math.max(0, 100 - Math.sqrt(variance)); // higher = more uniform color/texture

  // Simple, transparent thresholding \u2014 not a learned decision boundary.
  let grade = "Grade C";
  if (uniformity > 70 && mean > 60 && mean < 210) grade = "Grade A";
  else if (uniformity > 50) grade = "Grade B";

  return { mean: Math.round(mean), uniformity: Math.round(uniformity), grade };
}

export default function QualityGrader({ onGraded }) {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);

    const img = new Image();
    img.onload = () => setResult(analyzeImage(img));
    img.src = url;
  }

  return (
    <div className="quality-grader">
      <div className="quality-grader__disclaimer">
        Heuristic photo signal (brightness/uniformity) \u2014 not a trained AI model. Use as a starting
        point, not a final grade.
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} />
      {preview && (
        <div className="quality-grader__preview">
          <img src={preview} alt="Crop preview" />
          {result && (
            <div className="quality-grader__result">
              <div className="quality-grader__grade">{result.grade}</div>
              <div className="quality-grader__metrics">
                brightness {result.mean}/255 \u00b7 uniformity {result.uniformity}/100
              </div>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => onGraded && onGraded(result.grade)}
              >
                Use this grade
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

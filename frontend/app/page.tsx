"use client";

import {
  BarChart3,
  Calculator,
  CheckCircle2,
  FileDown,
  KeyRound,
  ShieldCheck,
  ShieldX,
  UserPlus,
  X,
} from "lucide-react";
import { type PointerEvent, useState } from "react";

import UploadBox from "@/components/UploadBox";

type VerifyLog = {
  timestamp: string;
  similarity: number;
  threshold: number;
  result: string;
};

type VectorMath = {
  dot: number;
  owner_norm: number;
  query_norm: number;
  denominator: number;
  cosine: number;
};

type VectorStage = {
  name: string;
  dimensions: number;
  owner: number[];
  query: number[];
  math: VectorMath;
};

type CrossSpaceReport = {
  owner_adaface_512: number[];
  owner_projected_256: number[];
  owner_projected_256_rebuilt_512: number[];
  query_pca_256_before_int8: number[];
  query_int8_256_raw: number[];
  query_int8_256_dequantized: number[];
  query_256_rebuilt_512: number[];
  math: {
    owner512_vs_query256_rebuilt512: VectorMath;
    owner_projected256_vs_query_pca256: VectorMath;
    owner_projected256_vs_query_int8_dequantized256: VectorMath;
    owner512_vs_owner256_rebuilt512: VectorMath;
  };
};

type VectorDebug = {
  cross_space_report?: CrossSpaceReport;
  stages: VectorStage[];
  formula: string;
  cross_space?: string;
  quantization: string;
};

type VerifyResponse = {
  similarity: number;
  rebuilt_512_similarity?: number;
  score_method?: string;
  threshold: number;
  result: string;
  log: VerifyLog[];
  vector_debug?: VectorDebug | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8011";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(0.42);
  const [status, setStatus] = useState("No owner enrolled yet");
  const [busyAction, setBusyAction] = useState<"enroll" | "verify" | null>(null);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [log, setLog] = useState<VerifyLog[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [ownerImageUrl, setOwnerImageUrl] = useState<string | null>(null);
  const [queryImageUrl, setQueryImageUrl] = useState<string | null>(null);

  async function postImage(path: "/enroll" | "/verify") {
    if (!file) {
      setStatus("Choose an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    if (path === "/verify") {
      formData.append("threshold", threshold.toString());
    }

    setBusyAction(path === "/enroll" ? "enroll" : "verify");
    setStatus(path === "/enroll" ? "Enrolling owner face..." : "Verifying face...");

    try {
      const imagePreview = await fileToDataUrl(file);
      const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? "Request failed");
      }

      if (path === "/enroll") {
        setResult(null);
        setIsReportOpen(false);
        setOwnerImageUrl(imagePreview);
        setQueryImageUrl(null);
        setStatus("Owner face enrolled");
      } else {
        setResult(data);
        setLog(data.log ?? []);
        setQueryImageUrl(imagePreview);
        setStatus(data.result);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusyAction(null);
    }
  }

  const granted = result?.result === "ACCESS GRANTED";

  return (
    <main className="access-shell">
      <div className="access-layout">
        <section className="access-main">
          <p className="eyebrow">AdaFace verification</p>
          <h1>One-face access control</h1>
          <p className="lead">
            Enroll the owner once, then verify uploads with AdaFace embeddings, PCA compression,
            int8 quantization, and cosine similarity.
          </p>

          <UploadBox file={file} onFileChange={setFile} />

          <div className="toolbar">
            <button
              className="action-button"
              disabled={!file || busyAction !== null}
              onClick={() => postImage("/enroll")}
              type="button"
            >
              <UserPlus size={18} aria-hidden="true" />
              Enroll
            </button>
            <button
              className="action-button secondary"
              disabled={!file || busyAction !== null}
              onClick={() => postImage("/verify")}
              type="button"
            >
              <KeyRound size={18} aria-hidden="true" />
              Verify
            </button>
          </div>

          <div className="threshold-row">
            <label htmlFor="threshold">Threshold</label>
            <span className="threshold-value">{threshold.toFixed(2)}</span>
            <input
              id="threshold"
              type="range"
              min="0.1"
              max="0.99"
              step="0.01"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
            />
          </div>

          <div className="result-panel">
            <div className={`result-status ${result ? (granted ? "granted" : "denied") : ""}`}>
              {result ? (
                granted ? (
                  <ShieldCheck size={24} aria-hidden="true" />
                ) : (
                  <ShieldX size={24} aria-hidden="true" />
                )
              ) : (
                <CheckCircle2 size={24} aria-hidden="true" />
              )}
              <span>{result?.result ?? status}</span>
            </div>
            <div className="similarity">
              Similarity: {result ? result.similarity.toFixed(4) : "--"} | Threshold:{" "}
              {threshold.toFixed(2)}
            </div>
          </div>

          {result?.vector_debug?.stages ? (
            <div className="vector-debug-panel">
              <div className="vector-debug-header">
                <h2>Vector comparison</h2>
                <span>{result.vector_debug.formula}</span>
              </div>
              <div className="vector-actions">
                <button className="vector-button" onClick={() => setIsReportOpen(true)} type="button">
                  <BarChart3 size={17} aria-hidden="true" />
                  <span>Open vector report</span>
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="access-log">
          <h2>Last 10 verifications</h2>
          {log.length > 0 ? (
            <ul className="log-list">
              {log
                .slice()
                .reverse()
                .map((item) => (
                  <li className="log-item" key={`${item.timestamp}-${item.similarity}`}>
                    <strong>{item.result}</strong>
                    <span>
                      sim {item.similarity.toFixed(4)} / threshold {item.threshold.toFixed(2)}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="empty-log">Verification attempts will appear here after the first check.</p>
          )}
        </aside>
      </div>

      {isReportOpen && result?.vector_debug ? (
        <VectorReportModal
          debug={result.vector_debug}
          similarity={result.similarity}
          scoreMethod={result.score_method}
          rebuilt512Similarity={result.rebuilt_512_similarity}
          ownerImageUrl={ownerImageUrl}
          queryImageUrl={queryImageUrl}
          onClose={() => setIsReportOpen(false)}
        />
      ) : null}
    </main>
  );
}

function VectorReportModal({
  debug,
  similarity,
  scoreMethod,
  rebuilt512Similarity,
  ownerImageUrl,
  queryImageUrl,
  onClose,
}: {
  debug: VectorDebug;
  similarity: number;
  scoreMethod?: string;
  rebuilt512Similarity?: number;
  ownerImageUrl: string | null;
  queryImageUrl: string | null;
  onClose: () => void;
}) {
  const adaFaceStage = debug.stages.find((stage) => stage.name === "AdaFace 512");
  const pcaStage = debug.stages.find((stage) => stage.name === "PCA 256");

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="דוח השוואת וקטורים">
      <div className="vector-modal report-hebrew" dir="rtl">
        <div className="modal-header">
          <div>
            <p className="eyebrow">דוח מלא</p>
            <h2>השוואת וקטור בעלים מול וקטור אימות</h2>
          </div>
          <div className="modal-actions">
            <button className="vector-button" onClick={() => window.print()} type="button">
              <FileDown size={17} aria-hidden="true" />
              <span>ייצוא PDF</span>
            </button>
            <button className="icon-button" onClick={onClose} type="button" aria-label="סגירת הדוח">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="modal-summary">
          {debug.stages.map((stage) => (
            <span key={stage.name}>
              {stageDisplayName(stage.name)}: קוסינוס {stage.math.cosine.toFixed(4)}
            </span>
          ))}
        </div>

        {adaFaceStage && pcaStage ? (
          <div className="compression-panel">
            <div>
              <h3>מסלול ה-POC בין מרחבים</h3>
              <p>
                וקטור הבעלים נשמר בשרת כ-AdaFace מקורי עם {adaFaceStage.owner.length} מספרים.
                וקטור האימות נדחס ל-{pcaStage.owner.length} מספרים בלבד, ואז השרת בונה ממנו
                קירוב חזרה ל-512 בעזרת inverse PCA כדי לאפשר השוואה.
              </p>
              {debug.cross_space ? <p>אי אפשר לחשב קוסינוס ישיר בין 512 ל-256, לכן משחזרים את ה-256 לקירוב של 512.</p> : null}
            </div>
            <div className="compression-bars">
              <span style={{ width: "100%" }}>512 מקורי בשרת</span>
              <span style={{ width: "50%" }}>256 שנשלח לאחר PCA</span>
              <span style={{ width: "100%" }}>256 שנבנה מחדש לקירוב 512</span>
            </div>
          </div>
        ) : null}

        {debug.cross_space_report ? (
          <CrossSpaceLab
            report={debug.cross_space_report}
            similarity={similarity}
            scoreMethod={scoreMethod}
            rebuilt512Similarity={rebuilt512Similarity}
            ownerImageUrl={ownerImageUrl}
            queryImageUrl={queryImageUrl}
          />
        ) : null}

        {debug.stages.map((stage) => (
          <VectorStageSection key={stage.name} stage={stage} formula={debug.formula} />
        ))}

        <div className="math-panel">
          <div className="math-title">
            <Calculator size={18} aria-hidden="true" />
            <strong>כלל הקוונטיזציה</strong>
          </div>
          <code>{debug.quantization}</code>
        </div>
      </div>
    </div>
  );
}

function CrossSpaceLab({
  report,
  similarity,
  scoreMethod,
  rebuilt512Similarity,
  ownerImageUrl,
  queryImageUrl,
}: {
  report: CrossSpaceReport;
  similarity: number;
  scoreMethod?: string;
  rebuilt512Similarity?: number;
  ownerImageUrl: string | null;
  queryImageUrl: string | null;
}) {
  const [windowStart, setWindowStart] = useState(0);
  const windowSize = 72;
  const maxStart = Math.max(0, report.owner_adaface_512.length - windowSize);

  function updateWindowFromPointer(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setWindowStart(Math.round(ratio * maxStart));
  }

  const owner512Window = report.owner_adaface_512.slice(windowStart, windowStart + windowSize);
  const rebuilt512Window = report.query_256_rebuilt_512.slice(windowStart, windowStart + windowSize);
  const ownerProjectedWindowStart = Math.floor(windowStart / 2);
  const ownerProjectedWindow = report.owner_projected_256.slice(
    ownerProjectedWindowStart,
    ownerProjectedWindowStart + Math.floor(windowSize / 2),
  );
  const query256Window = report.query_pca_256_before_int8.slice(
    ownerProjectedWindowStart,
    ownerProjectedWindowStart + Math.floor(windowSize / 2),
  );
  const queryInt8Window = report.query_int8_256_dequantized.slice(
    ownerProjectedWindowStart,
    ownerProjectedWindowStart + Math.floor(windowSize / 2),
  );

  return (
    <section className="cross-space-lab">
      <div className="hebrew-report-hero">
        <div>
          <p className="eyebrow">תקציר</p>
          <h3>512 מקורי מול 512 שנבנה מתוך 256</h3>
          <p>השרת מקבל 256 מספרים בלבד, משחזר קירוב ל-512, ואז משווה לבעלים המקורי.</p>
        </div>
        <div className="hero-score-card hero-score-card--decision">
          <span>ציון החלטה</span>
          <strong>{similarity.toFixed(6)}</strong>
          <small>{scoreMethod ?? "PCA 256 same-space cosine"}</small>
          {rebuilt512Similarity ? <small>rebuild 512 debug: {rebuilt512Similarity.toFixed(6)}</small> : null}
        </div>
        <div className="hero-score-card hero-score-card--rebuild">
          <span>ציון קוסינוס</span>
          <strong>{report.math.owner512_vs_query256_rebuilt512.cosine.toFixed(6)}</strong>
          <small>owner_512 מול rebuilt_query_512</small>
        </div>
      </div>

      <div className="stage-header">
        <div>
          <p className="eyebrow">השוואת POC מרכזית</p>
          <h3>וקטור מקור 512 מול וקטור 256 שנבנה מחדש ל-512</h3>
        </div>
        <strong>{report.math.owner512_vs_query256_rebuilt512.cosine.toFixed(6)}</strong>
      </div>

      <div className="server-image-panel">
        <div className="stage-header">
          <div>
            <p className="eyebrow">השוואה חזותית ראשית</p>
            <h3>512 מקורי של הבעלים מול 512 שנבנה מחדש מה-256</h3>
          </div>
          <strong>{report.math.owner512_vs_query256_rebuilt512.cosine.toFixed(6)}</strong>
        </div>
        <p>
          אלו לא תמונות פנים משוחזרות. אלו הווקטורים עצמם כשהם מצוירים כפיקסלים:
          משמאל וקטור AdaFace המקורי בגודל 512, ומימין הווקטור בגודל 512 שהשרת בנה מחדש
          מתוך ה-256 שהתקבל.
        </p>
        <div className="primary-image-grid">
          <PhotoPanel title="תמונת מקור שנרשמה" imageUrl={ownerImageUrl} />
          <PhotoPanel title="תמונת אימות שנשלחה" imageUrl={queryImageUrl} />
          <VectorPixelImage
            title="שמאל: AdaFace 512 מקורי"
            values={report.owner_adaface_512}
            columns={32}
            mode="float"
          />
          <VectorPixelImage
            title="ימין: 512 שנבנה מחדש"
            values={report.query_256_rebuilt_512}
            columns={32}
            mode="float"
          />
          <VectorDifferenceImage
            title="פיקסלים של ההפרש"
            owner={report.owner_adaface_512}
            query={report.query_256_rebuilt_512}
            columns={32}
          />
        </div>

        <div className="primary-graph-grid">
          <VectorLineGraph
            title="גרף קווי: 512 מול 512"
            owner={sampleVector(report.owner_adaface_512, 160)}
            query={sampleVector(report.query_256_rebuilt_512, 160)}
          />
          <VectorScatterGraph
            title="נקודות אלכסון: התאמה בין הערכים"
            owner={sampleVector(report.owner_adaface_512, 220)}
            query={sampleVector(report.query_256_rebuilt_512, 220)}
          />
        </div>

        <div className="math-panel">
          <div className="math-title">
            <Calculator size={18} aria-hidden="true" />
            <strong>מתמטיקת קוסינוס 512</strong>
          </div>
          <code>cos_sim = dot(owner_512, rebuilt_query_512) / (norm(owner_512) * norm(rebuilt_query_512))</code>
          <div className="math-grid">
            <span>dot</span>
            <strong>{report.math.owner512_vs_query256_rebuilt512.dot.toFixed(6)}</strong>
            <span>norm(owner_512)</span>
            <strong>{report.math.owner512_vs_query256_rebuilt512.owner_norm.toFixed(6)}</strong>
            <span>norm(rebuilt_query_512)</span>
            <strong>{report.math.owner512_vs_query256_rebuilt512.query_norm.toFixed(6)}</strong>
            <span>cosine</span>
            <strong>{report.math.owner512_vs_query256_rebuilt512.cosine.toFixed(6)}</strong>
          </div>
        </div>
      </div>

      <div className="bridge-math-grid">
        <MathCard title="512 מקורי מול 512 משוחזר" math={report.math.owner512_vs_query256_rebuilt512} />
        <MathCard title="256 של בעלים מול 256 אימות" math={report.math.owner_projected256_vs_query_pca256} />
        <MathCard
          title="256 של בעלים מול 256 אחרי int8"
          math={report.math.owner_projected256_vs_query_int8_dequantized256}
        />
        <MathCard title="בדיקת שחזור עצמי 512" math={report.math.owner512_vs_owner256_rebuilt512} />
      </div>

      <div className="draggable-graph-card">
        <div className="graph-card-header">
          <h3>חלון גרפי נגרר בתוך מרחב הווקטורים</h3>
          <span>
            מציג ממדי 512: {windowStart}-{Math.min(windowStart + windowSize - 1, 511)} וממדי 256:{" "}
            {ownerProjectedWindowStart}-{Math.min(ownerProjectedWindowStart + Math.floor(windowSize / 2) - 1, 255)}
          </span>
        </div>
        <svg
          className="drag-vector-svg"
          viewBox="0 0 720 260"
          role="img"
          aria-label="Draggable vector comparison graph"
          onPointerDown={updateWindowFromPointer}
          onPointerMove={(event) => {
            if (event.buttons === 1) {
              updateWindowFromPointer(event);
            }
          }}
        >
          <rect x="0" y="0" width="720" height="260" rx="8" fill="#fff" />
          <line x1="36" x2="696" y1="130" y2="130" stroke="#d9dcd2" />
          <line x1="36" x2="696" y1="222" y2="222" stroke="#d9dcd2" />
          <polyline points={graphPointsInBox(owner512Window, 36, 696, 130, 88, 12)} fill="none" stroke="#0f766e" strokeWidth="2" />
          <polyline points={graphPointsInBox(rebuilt512Window, 36, 696, 130, 88, 12)} fill="none" stroke="#b42318" strokeWidth="2" />
          <polyline points={graphPointsInBox(ownerProjectedWindow, 36, 696, 222, 38, 8)} fill="none" stroke="#115e59" strokeWidth="2" />
          <polyline points={graphPointsInBox(query256Window, 36, 696, 222, 38, 8)} fill="none" stroke="#7c2d12" strokeWidth="2" />
          <polyline points={graphPointsInBox(queryInt8Window, 36, 696, 222, 38, 8)} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 5" />
          <text x="38" y="24" fill="#6b7078" fontSize="12">top: 512 original vs rebuilt 512</text>
          <text x="38" y="200" fill="#6b7078" fontSize="12">bottom: 256 projected before/after int8</text>
        </svg>
        <div className="graph-legend">
          <span className="legend-owner">בעלים 512</span>
          <span className="legend-query">אימות משוחזר 512</span>
          <span className="legend-owner-256">בעלים 256</span>
          <span className="legend-query-256">אימות 256 לפני int8</span>
          <span className="legend-int8">אימות 256 אחרי int8</span>
        </div>
        <input
          className="window-slider"
          type="range"
          min="0"
          max={maxStart}
          value={windowStart}
          onChange={(event) => setWindowStart(Number(event.target.value))}
        />
      </div>

      <div className="bridge-array-grid">
        <FullArray title="שמאל: מערך מלא של AdaFace 512 המקורי" values={report.owner_adaface_512} />
        <FullArray title="ימין: מערך מלא של 512 שנבנה מחדש" values={report.query_256_rebuilt_512} />
      </div>

      <div className="bridge-array-grid">
        <div className="bridge-right-arrays">
          <FullArray title="משני: 256 לפני int8" values={report.query_pca_256_before_int8} />
          <FullArray title="משני: 256 כ-int8 גולמי" values={report.query_int8_256_raw} />
          <FullArray title="משני: 256 אחרי dequantize" values={report.query_int8_256_dequantized} />
        </div>
        <FullArray title="גשר: וקטור בעלים 512 שהוקרן ל-256" values={report.owner_projected_256} />
      </div>
    </section>
  );
}

function PhotoPanel({ title, imageUrl }: { title: string; imageUrl: string | null }) {
  return (
    <div className="photo-panel">
      <h4>{title}</h4>
      {imageUrl ? (
        <img src={imageUrl} alt={title} />
      ) : (
        <div className="missing-photo">יש לבצע הרשמה ואימות מחדש כדי לצרף תמונה לדוח.</div>
      )}
    </div>
  );
}

function VectorPixelImage({
  title,
  values,
  columns,
  mode,
}: {
  title: string;
  values: number[];
  columns: number;
  mode: "float" | "int8";
}) {
  return (
    <div className="vector-pixel-panel">
      <h4>{title}</h4>
      <div className="vector-pixel-image" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {values.map((value, index) => (
          <span
            key={`${title}-${index}`}
            title={`${index}: ${value}`}
            style={{ backgroundColor: vectorPixelColor(value, mode) }}
          />
        ))}
      </div>
    </div>
  );
}

function VectorDifferenceImage({
  title,
  owner,
  query,
  columns,
}: {
  title: string;
  owner: number[];
  query: number[];
  columns: number;
}) {
  return (
    <div className="vector-pixel-panel">
      <h4>{title}</h4>
      <div className="vector-pixel-image" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {owner.map((value, index) => {
          const diff = value - (query[index] ?? 0);
          return (
            <span
              key={`${title}-${index}`}
              title={`${index}: ${diff.toFixed(5)}`}
              style={{ backgroundColor: differencePixelColor(diff) }}
            />
          );
        })}
      </div>
    </div>
  );
}

function MathCard({ title, math }: { title: string; math: VectorMath }) {
  return (
    <div className="math-card">
      <h4>{title}</h4>
      <strong>{math.cosine.toFixed(6)}</strong>
      <span>dot {math.dot.toFixed(6)}</span>
      <span>נורמות {math.owner_norm.toFixed(4)} x {math.query_norm.toFixed(4)}</span>
    </div>
  );
}

function VectorStageSection({ stage, formula }: { stage: VectorStage; formula: string }) {
  const ownerSamples = sampleVector(stage.owner);
  const querySamples = sampleVector(stage.query);
  const diffSamples = ownerSamples.map((value, index) => value - querySamples[index]);

  return (
    <section className="stage-section">
      <div className="stage-header">
        <div>
          <p className="eyebrow">{stage.dimensions} ממדים</p>
          <h3>{stageDisplayName(stage.name)}</h3>
        </div>
        <strong>cosine {stage.math.cosine.toFixed(6)}</strong>
      </div>

      <div className="graph-grid">
        <VectorHeatmap title="Owner vector heatmap" values={ownerSamples} />
        <VectorHeatmap title="Query vector heatmap" values={querySamples} />
        <VectorHeatmap title="Owner - query heatmap" values={diffSamples} />
        <VectorLineGraph title="Owner/query line graph" owner={ownerSamples} query={querySamples} />
        <VectorScatterGraph title="Diagonal cosine graph" owner={ownerSamples} query={querySamples} />
      </div>

      <div className="math-panel">
        <div className="math-title">
          <Calculator size={18} aria-hidden="true" />
          <strong>מתמטיקת קוסינוס</strong>
        </div>
        <code>{formula}</code>
        <code>
          {stage.math.dot.toFixed(6)} / ({stage.math.owner_norm.toFixed(6)} *{" "}
          {stage.math.query_norm.toFixed(6)}) = {stage.math.cosine.toFixed(6)}
        </code>
        <div className="math-grid">
          <span>dot(a,b)</span>
          <strong>{stage.math.dot.toFixed(6)}</strong>
          <span>norm(owner)</span>
          <strong>{stage.math.owner_norm.toFixed(6)}</strong>
          <span>norm(query)</span>
          <strong>{stage.math.query_norm.toFixed(6)}</strong>
          <span>denominator</span>
          <strong>{stage.math.denominator.toFixed(6)}</strong>
          <span>cosine</span>
          <strong>{stage.math.cosine.toFixed(6)}</strong>
        </div>
      </div>

      <div className="full-array-grid">
        <FullArray title={`Owner ${stage.name} full array`} values={stage.owner} />
        <FullArray title={`Query ${stage.name} full array`} values={stage.query} />
      </div>
    </section>
  );
}

function VectorHeatmap({ title, values }: { title: string; values: number[] }) {
  return (
    <div className="heatmap-block">
      <h3>{title}</h3>
      <div className="heatmap">
        {values.map((value, index) => {
          const strength = Math.min(1, Math.abs(value) * 12);
          const color = value >= 0 ? "15, 118, 110" : "180, 35, 24";
          return (
            <span
              aria-hidden="true"
              className="heatmap-cell"
              key={`${title}-${index}`}
              style={{
                backgroundColor: `rgba(${color}, ${0.12 + strength * 0.78})`,
              }}
              title={`${index}: ${value.toFixed(5)}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function VectorLineGraph({
  title,
  owner,
  query,
}: {
  title: string;
  owner: number[];
  query: number[];
}) {
  const ownerPoints = graphPoints(owner);
  const queryPoints = graphPoints(query);

  return (
    <div className="graph-block graph-block--wide">
      <h3>{title}</h3>
      <svg className="vector-svg" viewBox="0 0 320 150" role="img" aria-label={title}>
        <line x1="0" x2="320" y1="75" y2="75" stroke="#d9dcd2" />
        <polyline points={ownerPoints} fill="none" stroke="#0f766e" strokeWidth="2" />
        <polyline points={queryPoints} fill="none" stroke="#b42318" strokeWidth="2" />
      </svg>
      <div className="graph-legend">
        <span className="legend-owner">owner</span>
        <span className="legend-query">query</span>
      </div>
    </div>
  );
}

function VectorScatterGraph({
  title,
  owner,
  query,
}: {
  title: string;
  owner: number[];
  query: number[];
}) {
  const points = owner.map((value, index) => ({
    x: scalePoint(value),
    y: 150 - scalePoint(query[index] ?? 0),
  }));

  return (
    <div className="graph-block graph-block--wide">
      <h3>{title}</h3>
      <svg className="vector-svg" viewBox="0 0 150 150" role="img" aria-label={title}>
        <line x1="0" x2="150" y1="150" y2="0" stroke="#131416" strokeDasharray="5 5" />
        <line x1="75" x2="75" y1="0" y2="150" stroke="#d9dcd2" />
        <line x1="0" x2="150" y1="75" y2="75" stroke="#d9dcd2" />
        {points.map((point, index) => (
          <circle cx={point.x} cy={point.y} fill="#0f766e" key={index} r="2" opacity="0.72" />
        ))}
      </svg>
      <div className="graph-note">Dots close to the diagonal mean owner and query values match.</div>
    </div>
  );
}

function FullArray({ title, values }: { title: string; values: number[] }) {
  return (
    <div className="array-block">
      <h3>{title}</h3>
      <pre>[{values.map((value) => value.toFixed(5)).join(", ")}]</pre>
    </div>
  );
}

function sampleVector(values: number[], sampleCount = 96) {
  if (values.length <= sampleCount) {
    return values;
  }

  const samples: number[] = [];
  const step = values.length / sampleCount;
  for (let index = 0; index < sampleCount; index += 1) {
    samples.push(values[Math.floor(index * step)]);
  }
  return samples;
}

function graphPoints(values: number[]) {
  return values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * 320;
      const y = 75 - Math.max(-1, Math.min(1, value * 10)) * 65;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function graphPointsInBox(
  values: number[],
  minX: number,
  maxX: number,
  midY: number,
  amplitude: number,
  multiplier: number,
) {
  return values
    .map((value, index) => {
      const x = minX + (index / Math.max(1, values.length - 1)) * (maxX - minX);
      const y = midY - Math.max(-1, Math.min(1, value * multiplier)) * amplitude;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function scalePoint(value: number) {
  const clamped = Math.max(-0.2, Math.min(0.2, value));
  return ((clamped + 0.2) / 0.4) * 150;
}

function stageDisplayName(name: string) {
  const names: Record<string, string> = {
    "Owner 512 vs query 256 rebuilt to 512": "512 מקורי מול 512 משוחזר מתוך 256",
    "AdaFace 512": "AdaFace 512 רגיל",
    "PCA 256": "PCA 256",
    "int8 256": "int8 256",
  };
  return names[name] ?? name;
}

function vectorPixelColor(value: number, mode: "float" | "int8") {
  const normalized = mode === "int8" ? Math.max(-1, Math.min(1, value / 127)) : Math.max(-0.2, Math.min(0.2, value)) / 0.2;
  const intensity = Math.round(((normalized + 1) / 2) * 255);
  const red = intensity;
  const blue = 255 - intensity;
  const green = Math.round(72 + Math.abs(normalized) * 72);
  return `rgb(${red}, ${green}, ${blue})`;
}

function differencePixelColor(value: number) {
  const clamped = Math.max(-0.2, Math.min(0.2, value));
  const normalized = clamped / 0.2;
  const alpha = 0.16 + Math.min(1, Math.abs(normalized)) * 0.84;
  return normalized >= 0 ? `rgba(180, 35, 24, ${alpha})` : `rgba(15, 118, 110, ${alpha})`;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

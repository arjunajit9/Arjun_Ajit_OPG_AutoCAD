"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileImage, LockKeyhole, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockOPGAnalysisProvider } from "@/features/opg-analysis/providers/mock-provider";
import { temporaryStudyStore } from "@/features/opg-analysis/storage/temporary-study-store";
import type { TemporaryStudy } from "@/features/opg-analysis/types";
import { validateAnonymousReference, validateUploadFile } from "@/features/opg-analysis/validation";

const maxMb = Number(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || 20);

export function UploadWorkflow() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [confirmed, setConfirmed] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string>();
  const [analysing, setAnalysing] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => { void temporaryStudyStore.cleanupExpired().catch(() => undefined); }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function chooseFile(candidate?: File) {
    if (!candidate) return;
    const result = validateUploadFile(candidate, maxMb);
    if (!result.valid) { setError(result.error); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(candidate); setPreview(URL.createObjectURL(candidate)); setConfirmed(false); setError(undefined);
  }

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(undefined); setPreview(undefined); setConfirmed(false); setError(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function analyse() {
    if (!file || !confirmed) return;
    const referenceResult = validateAnonymousReference(reference);
    if (!referenceResult.valid) { setError(referenceResult.error); return; }
    setAnalysing(true); setError(undefined);
    const id = crypto.randomUUID();
    try {
      const hours = Number(process.env.NEXT_PUBLIC_TEMP_STUDY_HOURS || 24);
      const study: TemporaryStudy = {
        id, image: file, fileName: file.name, mediaType: file.type as "image/jpeg" | "image/png",
        studyReference: reference.trim() || undefined, createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + hours * 3_600_000).toISOString(), comments: "",
      };
      await temporaryStudyStore.put(study);
      const result = await new MockOPGAnalysisProvider().analyse({ analysisId: id, fileName: file.name, mediaType: study.mediaType, fileSize: file.size, studyReference: study.studyReference });
      await temporaryStudyStore.put({ ...study, result });
      router.push(`/opg-assistant/analysis/${id}`);
    } catch {
      setAnalysing(false); setError("Unable to complete the demonstration analysis. The image has not been sent to a server.");
      await temporaryStudyStore.delete(id).catch(() => undefined);
    }
  }

  return (
    <section className="upload-layout" aria-labelledby="upload-title">
      <div className="panel upload-panel">
        <div className="panel-heading"><span className="step-number">1</span><div><h2 id="upload-title">Select a thesis-study OPG</h2><p>Analysis scope: mandibular third molars 38 and 48 only · JPEG or PNG · maximum {maxMb} MB</p></div></div>
        {!file ? (
          <div className={`dropzone ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
            <UploadCloud size={36} aria-hidden="true" /><strong>Drop a panoramic image here</strong><span>or choose a file from this device</span>
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>Choose image</Button>
            <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={(event) => chooseFile(event.target.files?.[0])} aria-label="Choose OPG image" />
          </div>
        ) : (
          <div className="preview-card">
            <div className="preview-image"><Image src={preview!} alt="Preview of selected panoramic image" fill unoptimized /></div>
            <div className="file-row"><FileImage /><div><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB · stored temporarily in this browser</span></div><Button variant="ghost" onClick={clearFile} aria-label="Remove selected image"><Trash2 size={18} /></Button></div>
          </div>
        )}
        {error && <div className="error-message" role="alert">{error}</div>}
      </div>
      <div className="panel confirmation-panel">
        <div className="panel-heading"><span className="step-number">2</span><div><h2>Confirm and analyse</h2><p>Analysis starts only after your confirmation.</p></div></div>
        <label className="check-card"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span className="custom-check"><CheckCircle2 /></span><span><strong>I confirm this image contains no directly identifying patient information.</strong><small>Do not use names, dates of birth, hospital numbers, contact details, or burned-in identifiers.</small></span></label>
        <label className="field-label" htmlFor="study-reference">Anonymous study reference <span>Optional</span></label>
        <input id="study-reference" className="text-input" value={reference} maxLength={80} onChange={(event) => setReference(event.target.value)} placeholder="e.g. STUDY-001 (not a hospital number)" />
        <div className="privacy-note"><LockKeyhole size={18} /><span><strong>Local prototype:</strong> the image is not uploaded to a server and expires from browser storage after 24 hours.</span></div>
        <Button className="analyse-button" disabled={!file || !confirmed || analysing} onClick={() => void analyse()}>{analysing ? <><span className="spinner" /> Analysing demonstration…</> : "Analyse image"}</Button>
        <p className="mock-note">Mock angulation classifications are pre-defined and not derived from image pixels. Pericoronitis requires separate clinical assessment.</p>
      </div>
    </section>
  );
}

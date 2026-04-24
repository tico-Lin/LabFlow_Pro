import { invoke } from "@tauri-apps/api/core";
import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfViewerProps = {
  hash: string;
};

export default function PdfViewer({ hash }: PdfViewerProps) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const normalizedHash = hash.trim();

    if (!normalizedHash) {
      setPdfData(null);
      setPageCount(0);
      setError("缺少檔案雜湊值");
      return;
    }

    let cancelled = false;

    const loadPdf = async () => {
      setLoading(true);
      setError(null);

      try {
        const bytes = await invoke<Uint8Array>("read_blob_bytes", {
          hash: normalizedHash,
        });

        if (cancelled) {
          return;
        }

        const normalizedBytes = Array.isArray(bytes)
          ? new Uint8Array(bytes)
          : bytes;
        setPdfData(normalizedBytes);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message =
          loadError instanceof Error
            ? loadError.message
            : "讀取 PDF 失敗";
        setPdfData(null);
        setPageCount(0);
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [hash]);

  const pageNumbers = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount]
  );

  return (
    <section className="pdf-viewer-shell" aria-live="polite">
      {loading && <p className="pdf-viewer-status">PDF 載入中...</p>}
      {error && <p className="pdf-viewer-error">{error}</p>}

      {!loading && !error && !pdfData && (
        <p className="pdf-viewer-status">尚未提供 PDF 資料</p>
      )}

      {pdfData && (
        <div className="pdf-viewer-scroll">
          <Document
            file={{ data: pdfData }}
            className="pdf-document"
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
            onLoadError={(documentError) => {
              setError(documentError.message);
              setPageCount(0);
            }}
            loading={<p className="pdf-viewer-status">解析 PDF 中...</p>}
          >
            {(pageCount > 0 ? pageNumbers : [1]).map((pageNumber) => (
              <div key={pageNumber} className="pdf-page-frame">
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </Document>
        </div>
      )}
    </section>
  );
}

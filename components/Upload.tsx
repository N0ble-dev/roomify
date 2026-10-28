import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
  onComplete: (base64: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn: isSignedIn } = useOutletContext<AuthContext>();
  const signedInRef = useRef(isSignedIn);
  const onCompleteRef = useRef(onComplete);
  const readerRef = useRef<FileReader | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  signedInRef.current = isSignedIn;
  onCompleteRef.current = onComplete;

  const clearProgressInterval = useCallback(() => {
    if (intervalRef.current === null) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const cancelUpload = useCallback(() => {
    clearProgressInterval();
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;

    const reader = readerRef.current;
    readerRef.current = null;
    if (reader) {
      reader.onload = null;
      reader.onerror = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
    }
  }, [clearProgressInterval]);

  useEffect(() => {
    if (!isSignedIn) {
      cancelUpload();
      setFile(null);
      setProgress(0);
      setIsDragging(false);
      setError(null);
    }

    return cancelUpload;
  }, [isSignedIn, cancelUpload]);

  const processFile = (selectedFile: File) => {
    if (
      !signedInRef.current ||
      file ||
      readerRef.current ||
      intervalRef.current !== null ||
      timeoutRef.current !== null
    ) {
      return;
    }

    if (!["image/png", "image/jpeg"].includes(selectedFile.type)) {
      setError("Please choose a JPG or PNG image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }

    setFile(selectedFile);
    setProgress(0);
    setError(null);

    const reader = new FileReader();
    readerRef.current = reader;

    const handleReadError = () => {
      cancelUpload();
      if (!signedInRef.current) return;
      setFile(null);
      setProgress(0);
      setError("We couldn't read this image. Please try another file.");
    };

    reader.onerror = handleReadError;
    reader.onload = () => {
      if (!signedInRef.current) return;
      const base64 = reader.result;
      if (typeof base64 !== "string") {
        handleReadError();
        return;
      }
      readerRef.current = null;
      let currentProgress = 0;

      intervalRef.current = setInterval(() => {
        if (!signedInRef.current) {
          cancelUpload();
          return;
        }

        currentProgress = Math.min(
          currentProgress + Math.random() * PROGRESS_INCREMENT + PROGRESS_STEP,
          100,
        );
        setProgress(currentProgress);

        if (currentProgress === 100) {
          clearProgressInterval();
          timeoutRef.current = setTimeout(async () => {
            timeoutRef.current = null;
            if (!signedInRef.current) return;
            try {
              await onCompleteRef.current(base64);
            } catch {
              if (!signedInRef.current) return;
              setFile(null);
              setProgress(0);
              setError(
                "We couldn't continue with this image. Please try again.",
              );
            }
          }, REDIRECT_DELAY_MS);
        }
      }, PROGRESS_INTERVAL_MS);
    };

    try {
      reader.readAsDataURL(selectedFile);
    } catch {
      handleReadError();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    const selectedFile = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      event.dataTransfer.dropEffect = "none";
      return;
    }
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) return;
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) return;
    setIsDragging(false);
    const selectedFile = event.dataTransfer.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-disabled={!isSignedIn}
        >
          <input
            type="file"
            className="drop-input"
            accept=".png,.jpg,.jpeg"
            disabled={!isSignedIn}
            onChange={handleChange}
            aria-label="Upload a floor plan"
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Drag & drop your file here"
                : "Please sign in to upload a file"}
            </p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>
            <h3>{file.name}</h3>
            <div
              className="progress"
              role="progressbar"
              aria-label="Preparing floor plan"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="status-text" role="status">
              {progress < 100 ? "Preparing Floor Plan..." : "Floor Plan Ready"}
            </p>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};

export default Upload;

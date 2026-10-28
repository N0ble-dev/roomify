import { useNavigate, useOutletContext, useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import Button from "../../components/ui/Button";
import { createProject, getProjectById } from "../../lib/puter.action";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { generate3DView } from "../../lib/ai.action";
import { getErrorMessage } from "../../lib/utils";
import { useErrorToast } from "../../components/toasts/ErrorToast";
import { useNoticeToast } from "../../components/toasts/NoticeToast";

const VisualizerId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useOutletContext<AuthContext>();
  const { showToast: showError } = useErrorToast();
  const { showToast: showNotice } = useNoticeToast();

  const hasInitialGenerated = useRef(false);
  const generationRequestRef = useRef<{
    projectId: string;
    canceled: boolean;
  } | null>(null);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [reloadAttempt, setReloadAttempt] = useState(0);

  useEffect(() => {
    return () => {
      if (generationRequestRef.current) {
        generationRequestRef.current.canceled = true;
      }
    };
  }, [id]);

  const handleBack = () => navigate("/");
  const handleExport = () => {
    if (!currentImage) return;

    const link = document.createElement("a");
    link.href = currentImage;
    link.download = `roomify-${id || "design"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || item.id !== id || !item.sourceImage) return;
    if (
      generationRequestRef.current?.projectId === id &&
      !generationRequestRef.current.canceled
    ) {
      return;
    }

    const request = { projectId: id, canceled: false };
    generationRequestRef.current = request;
    setGenerationError(null);
    setIsProcessing(true);

    try {
      const result = await generate3DView({ sourceImage: item.sourceImage });
      if (request.canceled) return;

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        };
        setProject(updatedItem);

        try {
          const saved = await createProject({
            item: updatedItem,
            visibility: item.isPublic ? "public" : "private",
          });
          if (request.canceled) return;

          if (saved?.renderedImage) {
            setProject(saved);
            setCurrentImage(saved.renderedImage);
          } else {
            showNotice(
              "Your render is ready, but couldn't be saved. Export it to keep a copy.",
            );
          }
        } catch (error) {
          console.error("Saving the render failed:", error);
          if (!request.canceled) {
            showNotice(
              "Your render is ready, but couldn't be saved. Export it to keep a copy.",
            );
          }
        }
      }
    } catch (error) {
      console.error("Generation failed: ", error);
      if (!request.canceled) {
        const message = getErrorMessage(
          error,
          "We couldn't generate your 3D view. Please try again.",
        );
        setGenerationError(message);
        showError(message);
      }
    } finally {
      if (generationRequestRef.current === request) {
        generationRequestRef.current = null;
      }
      if (!request.canceled) setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);
      setProjectError(null);
      setGenerationError(null);
      setIsProcessing(false);
      setProject(null);
      setCurrentImage(null);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;
      if (!fetchedProject) {
        setProjectError(
          "We couldn't load this project. Check that you're signed in, then try again.",
        );
      }

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id, reloadAttempt]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />

          <span className="name">Roomify</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{project?.name || `Residence ${id}`}</h2>
              <p className="note">Created by You</p>
            </div>

            <div className="panel-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => project && void runGeneration(project)}
                disabled={!project || isProcessing || isProjectLoading}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                {isProcessing
                  ? "Generating..."
                  : generationError
                    ? "Try again"
                    : currentImage
                      ? "Regenerate"
                      : "Generate 3D view"}
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" onClick={() => {}} className="share">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {generationError && (
            <div
              role="alert"
              className="border-b border-red-200 bg-danger-soft px-5 py-4 text-sm text-danger"
            >
              <p className="font-semibold">The 3D render wasn't generated.</p>
              <p className="mt-1">{generationError}</p>
            </div>
          )}

          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {isProjectLoading && (
              <p role="status" className="p-6 text-sm text-zinc-600">
                Loading floor plan...
              </p>
            )}
            {projectError && (
              <div role="alert" className="p-6 text-sm text-danger">
                <p>{projectError}</p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setReloadAttempt((attempt) => attempt + 1)}
                >
                  Reload project
                </Button>
              </div>
            )}
            {currentImage ? (
              <img src={currentImage} alt="AI Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {project?.sourceImage && (
                  <img
                    src={project?.sourceImage}
                    alt="Original"
                    className="render-fallback"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering...</span>
                  <span className="subtitle">
                    Generating your 3D visualization
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before and After</h3>
            </div>
            <div className="hint">Drag to compare</div>
          </div>

          <div className="compare-stage">
            {project?.sourceImage && currentImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ width: "100%", height: "auto" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={project?.sourceImage}
                    alt="before"
                    className="compare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={currentImage}
                    alt="after"
                    className="compare-img"
                  />
                }
              />
            ) : (
              <div className="compare-fallback">
                {project?.sourceImage && (
                  <img
                    src={project.sourceImage}
                    alt="Before"
                    className="compare-img"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
export default VisualizerId;

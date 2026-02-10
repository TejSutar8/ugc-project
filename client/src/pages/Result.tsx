import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Project } from "../types";
import {
  ImageIcon,
  VideoIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparkleIcon,
} from "lucide-react";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/axios";

const Result = () => {
  const { projectId } = useParams();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const [project, setProjectData] = useState<Project>({} as Project);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchProjectData = async (retryCount = 0) => {
    try {
      const token = await getToken();
      const { data } = await api.get(`/api/user/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("📥 Project data fetched:", {
        id: data.project.id,
        isGenerating: data.project.isGenerating,
        hasImage: !!data.project.generatedImage,
        hasError: !!data.project.error
      });
      
      setProjectData(data.project);
      setIsGenerating(data.project.isGenerating || false);
      setLoading(false);
      
      // Show success toast when image is ready
      if (!data.project.isGenerating && data.project.generatedImage && retryCount === 0) {
        toast.success("✨ Image generated successfully!");
      }
      
      // Stop polling if there's an error
      if (data.project.error) {
        setIsGenerating(false);
        toast.error("Generation failed: " + data.project.error);
      }
    } catch (error: any) {
      console.error("❌ Error fetching project:", error);
      
      // Retry up to 3 times with 1 second delay for 404 errors (project might not be in DB yet)
      if (error?.response?.status === 404 && retryCount < 3) {
        console.log(`🔄 Retrying fetch... (${retryCount + 1}/3)`);
        setTimeout(() => fetchProjectData(retryCount + 1), 1000);
        return;
      }
      
      toast.error(error?.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!project?.generatedImage) {
      toast.error("Please wait for image to generate first");
      return;
    }
    
    setIsGenerating(true);
    toast.loading("Starting video generation...");
    
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/project/video",
        { projectId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state
      setProjectData((prev) => ({
        ...prev,
        generatedVideo: data.videoUrl,
        isGenerating: false,
      }));

      toast.dismiss();
      toast.success("Video generated successfully!");
    } catch (error: any) {
      setIsGenerating(false);
      toast.dismiss();
      toast.error(error?.response?.data?.message || error.message);
      console.error("Video generation error:", error);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        navigate("/");
      } else if (projectId) {
        fetchProjectData();
      }
    }
  }, [user, isLoaded, projectId]);

  // Auto-refresh when generating
  useEffect(() => {
    if (!user || loading) return;

    // If project is generating, poll for updates
    if (isGenerating && project?.id) {
      console.log("Starting auto-refresh polling...");
      
      // Quick checks: 2s, 5s, 8s
      const check1 = setTimeout(() => fetchProjectData(), 2000);
      const check2 = setTimeout(() => fetchProjectData(), 5000);
      const check3 = setTimeout(() => fetchProjectData(), 8000);

      // Then check every 5 seconds
      const interval = setInterval(() => {
        console.log("Polling for updates...");
        fetchProjectData();
      }, 5000);
      
      return () => {
        clearTimeout(check1);
        clearTimeout(check2);
        clearTimeout(check3);
        clearInterval(interval);
      };
    }
  }, [user, isGenerating, loading, project?.id]);

  return loading ? (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
      <Loader2Icon className="animate-spin text-indigo-600 size-9" />
      <p className="text-gray-400">Loading project...</p>
    </div>
  ) : !project?.id ? (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
      <p className="text-red-400 text-xl">Project not found</p>
      <Link to="/my-generations" className="text-indigo-400 hover:underline">
        Go to My Generations
      </Link>
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 mt-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-medium">
            Generation Result
          </h1>
          <Link
            to="/generate"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            <p className="max-sm:hidden">New Generation</p>
          </Link>
        </header>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8 ">
          {/* Main Result Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Banner */}
            {project.error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                <div>
                  <p className="font-medium text-red-400">Generation Failed</p>
                  <p className="text-sm text-gray-400">{project.error}</p>
                  <Link to="/generate" className="text-sm text-indigo-400 hover:underline mt-2 inline-block">
                    Try again
                  </Link>
                </div>
              </div>
            )}

            {/* Generating Banner */}
            {isGenerating && !project.error && (
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-center gap-3">
                <Loader2Icon className="animate-spin text-yellow-400 size-5" />
                <div>
                  <p className="font-medium text-yellow-400">Generating your image...</p>
                  <p className="text-sm text-gray-400">This may take up to 30 seconds. Page will auto-refresh.</p>
                </div>
              </div>
            )}

            <div className="glass-panel inline-block p-2 rounded-2xl">
              <div
                className={`${project?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"} sm:max-h-200 rounded-xl bg-gray-900 overflow-hidden relative`}
              >
                {project?.generatedVideo ? (
                  <video
                    src={project.generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover "
                  />
                ) : project?.generatedImage ? (
                  <img
                    src={project.generatedImage}
                    alt="Generated Result"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Loader2Icon className="animate-spin text-indigo-400 size-12" />
                    <p className="text-gray-400">Generating image...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Download Button */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Actions</h3>
              <div className="flex flex-col gap-3">
                <a href={project.generatedImage} download>
                  <GhostButton
                    disabled={!project.generatedImage}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="size-4.5" />
                    Download Image
                  </GhostButton>
                </a>
                <a href={project.generatedVideo} download>
                  <GhostButton
                    disabled={!project.generatedVideo}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <VideoIcon className="size-4.5" />
                    Download Video
                  </GhostButton>
                </a>
              </div>
            </div>

            {/* Generate Video Button */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <VideoIcon className="size-24" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Magic</h3>
              <p className="text-gray-400 text-sm mb-6">
                Turn this static image into a dynamic video for social media.
              </p>
              {!project.generatedVideo ? (
                <PrimaryButton
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || !project?.generatedImage}
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <SparkleIcon className="size-4" />
                      Generate Video
                    </>
                  )}
                </PrimaryButton>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium">
                  Video Generated Successfully
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

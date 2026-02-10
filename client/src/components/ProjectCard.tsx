import type React from "react";
import type { Project } from "../types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  EllipsisIcon,
  ImageIcon,
  Loader2Icon,
  PlaySquareIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { GhostButton, PrimaryButton } from "./Buttons";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/axios";
import toast from "react-hot-toast";

const ProjectCard = ({
  gen,
  setGenerations,
  forCommunity = false,
}: {
  gen: Project;
  setGenerations: React.Dispatch<React.SetStateAction<Project[]>>;
  forCommunity?: boolean;
}) => {
  const { getToken } = useAuth();

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this project?",
    );
    if (!confirm) return;
    try {
      const token = await getToken();
      const { data } = await api.delete(`/api/project/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGenerations((generations) =>
        generations.filter((gen) => gen.id !== id),
      );
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    }
  };
  const togglePublish = async (projectId: string) => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/user/publish/${projectId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGenerations((generations) =>
        generations.map((gen) =>
          gen.id === projectId
            ? { ...gen, isPublished: data.isPublished }
            : gen,
        ),
      );
      toast.success(
        data.isPublished ? "Project published" : "Project unpublished",
      );
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error);
    }
  };

  return (
    <div key={gen.id} className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">
        {/* Preview */}
        <div
          className={`${gen?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"} relative overflow-hidden`}
        >
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName}
              className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${gen.generatedVideo ? `group-hover:opacity-0` : `group-hover:opacity-105`}`}
            />
          )}

          {gen.generatedVideo && (
            <video
              src={gen.generatedVideo}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause}
            />
          )}

          {!gen?.generatedImage && !gen?.generatedVideo && (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/20">
              <Loader2Icon className="size-7 animate-spin" />
            </div>
          )}

          {/* Status badges */}
          <div className="absolute left-3 top-3 flex gap-2 items-center">
            {gen.isGenerating && (
              <span className="text-xs px-2 py-1 bg-yellow-600/30 rounded-full">
                Generating
              </span>
            )}
            {gen.isPublished && (
              <span className="text-xs px-2 py-1 bg-green-600/30 rounded-full">
                Published
              </span>
            )}
          </div>

          {/* action menu for my generations only */}
          {!forCommunity && (
            <div
              className="absolute right-3 top-3 sm:opacity-0 group-hover:opacity-100 transition"
            >
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full p-1.5 transition-all border border-white/10"
              >
                <EllipsisIcon className="size-5 text-white" />
              </button>
              
              {menuOpen && (
                <ul
                  className="absolute top-10 right-0 w-44 bg-black/90 backdrop-blur-xl text-white border border-white/20 rounded-lg shadow-xl py-1 z-20"
                >
                  {gen.generatedImage && (
                    <li>
                      <a
                        href={gen.generatedImage}
                        download={`${gen.productName}-image.png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 items-center px-4 py-2.5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <ImageIcon size={16} />
                        <span className="text-sm">Download Image</span>
                      </a>
                    </li>
                  )}
                  {gen.generatedVideo && (
                    <li>
                      <a
                        href={gen.generatedVideo}
                        download={`${gen.productName}-video.mp4`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 items-center px-4 py-2.5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <PlaySquareIcon size={16} />
                        <span className="text-sm">Download Video</span>
                      </a>
                    </li>
                  )}
                  {(gen.generatedVideo || gen.generatedImage) && (
                    <li>
                      <button
                        onClick={() =>
                          navigator.share({
                            url: gen.generatedVideo || gen.generatedImage,
                            title: gen.productName,
                            text: gen.productDescription,
                          })
                        }
                        className="w-full flex gap-3 items-center px-4 py-2.5 hover:bg-white/10 cursor-pointer transition-colors text-left"
                      >
                        <Share2Icon size={16} />
                        <span className="text-sm">Share</span>
                      </button>
                    </li>
                  )}
                  <li className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => handleDelete(gen.id)}
                      className="w-full flex gap-3 items-center px-4 py-2.5 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors text-left"
                    >
                      <Trash2Icon size={16} />
                      <span className="text-sm">Delete</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}

          {/* Source Images */}
          <div className="absolute right-3 bottom-3">
            <img
              src={gen.uploadedImages[0]}
              alt="product"
              className="w-16 h-16 object-cover rounded-full animate-float"
            />
            <img
              src={gen.uploadedImages[1]}
              alt="model"
              className="w-16 h-16 object-cover rounded-full animate-float -ml-8"
              style={{ animationDelay: "3s" }}
            />
          </div>
        </div>

        {/* details */}
        <div className="p-4">
          {/* Product name, date, aspect ratio */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{gen.productName}</h3>
              <p className="text-sm text-gray-400">
                Created: {new Date(gen.createdAt).toLocaleString()}
              </p>
              {gen.updatedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Updated: {new Date(gen.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="mt-2 flex flex-col items-end gap-1">
                <span className="text-xs px-2 py-1 bg-white/5">
                  Aspect: {gen.aspectRatio}
                </span>
              </div>
            </div>
          </div>
          {/* Product description */}
          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <div className="text-sm text-gray-300 bg-white/3 p-2 rounded-md wrap-break-word">
                {gen.productDescription}
              </div>
            </div>
          )}

          {/* User prompt */}
          {gen.userPrompt && (
            <div className="mt-3">
              <div className="text-sm text-gray-300">{gen.userPrompt}</div>
            </div>
          )}

          {/* Buttons */}
          {!forCommunity && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <GhostButton
                className="text-xs justify-center"
                onClick={() => {
                  navigate(`/result/${gen.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                View Details
              </GhostButton>
              <PrimaryButton
                onClick={() => togglePublish(gen.id)}
                className="rounded-md"
              >
                {gen.isPublished ? "Unpublish" : "Publish"}
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

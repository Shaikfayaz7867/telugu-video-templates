"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getDownloadLink, type Video } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

export function VideoCard({ video }: { video: Video }) {
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [previewing, setPreviewing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const didPrefetchRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const onDownload = async () => {
    try {
      setDownloading(true);
      const { url, filename } = await getDownloadLink(video._id);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "video";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Download started");
    } catch (e: any) {
      toast.error(e?.message || "Failed to get download link");
    } finally {
      setDownloading(false);
    }
  };

  const ensurePreviewUrl = async () => {
    if (previewUrl) return previewUrl;
    try {
      setPreviewing(true);
      const { url } = await getDownloadLink(video._id);
      setPreviewUrl(url);
      // attempt to capture a poster image from the first frame
      try {
        const vid = document.createElement("video");
        vid.crossOrigin = "anonymous";
        vid.src = url;
        vid.muted = true;
        vid.playsInline = true as any;
        await new Promise<void>((resolve) => {
          vid.addEventListener("loadeddata", () => resolve(), { once: true });
        });
        // seek a little to ensure we have a frame
        try {
          vid.currentTime = Math.min(0.1, vid.duration || 0.1);
          await new Promise<void>((resolve) => {
            vid.addEventListener("seeked", () => resolve(), { once: true });
          });
        } catch {}
        const canvas = document.createElement("canvas");
        canvas.width = vid.videoWidth || 640;
        canvas.height = vid.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
          const data = canvas.toDataURL("image/jpeg", 0.7);
          setPoster(data);
        }
      } catch {
        // ignore poster capture errors (CORS, etc.)
      }
      return url;
    } catch (e: any) {
      toast.error(e?.message || "Failed to load preview");
      return undefined;
    } finally {
      setPreviewing(false);
    }
  };

  // Prefetch signed URL and poster when card enters viewport
  useEffect(() => {
    if (didPrefetchRef.current) return;
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !didPrefetchRef.current) {
          didPrefetchRef.current = true;
          await ensurePreviewUrl();
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const handleMouseEnter = async () => {
    const url = await ensurePreviewUrl();
    if (url && videoRef.current) {
      try {
        await videoRef.current.play();
      } catch {
        /* ignore autoplay rejection */
      }
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleTouch = async () => {
    // Toggle play on tap for mobile
    const el = videoRef.current;
    if (!el) return;
    if (!previewUrl) await ensurePreviewUrl();
    if (el.paused) {
      try { await el.play(); } catch {}
    } else {
      el.pause();
    }
  };

  // Enable sound after any user click on the page (to satisfy autoplay policies)
  useEffect(() => {
    const onAnyClick = () => setSoundEnabled(true);
    window.addEventListener("click", onAnyClick, { once: true });
    return () => window.removeEventListener("click", onAnyClick);
  }, []);

  // Keep the element's muted property in sync with state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !soundEnabled;
    }
  }, [soundEnabled]);

  return (
    <div ref={containerRef}>
    <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="p-4">
        <CardTitle className="text-base truncate" title={video.name}>{video.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouch}
        >
          {/* Sound toggle button */}
          <button
            type="button"
            aria-label={soundEnabled ? "Mute preview" : "Unmute preview"}
            onClick={(e) => {
              e.stopPropagation();
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (videoRef.current) {
                videoRef.current.muted = !next;
                if (next) {
                  // attempt to play with sound after explicit user click
                  try { videoRef.current.play(); } catch {}
                }
              }
            }}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-2 text-white shadow hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <video
            ref={videoRef}
            className="aspect-video w-full bg-black"
            src={previewUrl}
            preload="metadata"
            muted={!soundEnabled}
            playsInline
            loop
            poster={poster}
            controls={false}
          />
          {/* Thumbnail overlay (until poster/preview available) */}
          {!poster && !previewUrl && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-background/70 backdrop-blur flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 opacity-80">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <motion.div whileTap={{ scale: 0.96 }} className="w-full">
          <Button onClick={onDownload} disabled={downloading} className="w-full">
            {downloading ? "Preparing..." : "Download"}
          </Button>
        </motion.div>
      </CardFooter>
    </Card>
    </motion.div>
    </div>
  );
}

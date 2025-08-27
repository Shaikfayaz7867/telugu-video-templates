"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { listVideos, type Video } from "@/lib/api";
import { VideoCard } from "@/components/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Film, Search } from "lucide-react";

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Reset list when search term changes
  useEffect(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
  }, [search]);

  useEffect(() => {
    let ignore = false;
    const fetchPage = async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      try {
        const res = await listVideos(page, 12, search || undefined);
        if (ignore) return;
        setVideos((prev) => [...prev, ...res.items]);
        setHasMore(res.hasMore);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPage();
    return () => {
      ignore = true;
    };
  }, [page, search]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const node = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="container mx-auto container-px py-6">
      {/* Top loader for search/reset or initial load */}
      {loading && page === 1 && (
        <div className="fixed left-0 right-0 top-[56px] z-40 h-1 bg-transparent">
          <div className="h-full w-1/3 animate-[loader_1.2s_ease-in-out_infinite] rounded-r bg-primary" />
          <style jsx>{`
            @keyframes loader {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(100%); }
              100% { transform: translateX(300%); }
            }
          `}</style>
        </div>
      )}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold inline-flex items-center gap-2">
          <Film className="h-6 w-6 text-primary" /> All Videos
        </h2>
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search videos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && page === 1 && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" /> Searching…
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`s-${i}`} className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
      </div>
      <div ref={loaderRef} className="h-10" />
      {!hasMore && videos.length > 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">You have reached the end.</p>
      )}
    </div>
  );
}

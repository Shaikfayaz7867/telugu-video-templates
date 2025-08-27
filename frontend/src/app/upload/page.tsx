"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { uploadVideo } from "@/lib/api";
import { toast } from "sonner";
import { FileVideo, Type as TypeIcon, Upload as UploadIcon } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 10 * 1024 * 1024) {
      toast.error("Max file size is 10MB");
      e.currentTarget.value = "";
      setFile(null);
      return;
    }
    setFile(f ?? null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a name");
    if (!file) return toast.error("Please select a video file");
    try {
      setSubmitting(true);
      setProgress(0);
      await uploadVideo(name.trim(), file, setProgress);
      toast.success("Uploaded successfully");
      router.push("/home");
      router.refresh();
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto container-px py-8 max-w-xl">
      <h2 className="mb-6 text-2xl font-bold inline-flex items-center gap-2">
        <FileVideo className="h-6 w-6 text-primary" /> Upload Video
      </h2>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium inline-flex items-center gap-1">
            <TypeIcon className="h-4 w-4" /> Name
          </label>
          <Input
            placeholder="Enter video name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium inline-flex items-center gap-1">
            <FileVideo className="h-4 w-4" /> Video File (max 10MB)
          </label>
          <Input type="file" accept="video/*" onChange={onFileChange} disabled={submitting} />
        </div>
        {submitting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        <Button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2">
          {submitting ? (
            <>Uploading... <UploadIcon className="h-4 w-4 animate-pulse" /></>
          ) : (
            <>Upload <UploadIcon className="h-4 w-4" /></>
          )}
        </Button>
      </form>
    </div>
  );
}

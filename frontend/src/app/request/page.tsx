"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendRequest } from "@/lib/api";
import { toast } from "sonner";
import { MailPlus, User, AtSign, MessageSquare, Video as VideoIcon, Send } from "lucide-react";

export default function RequestPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [videoName, setVideoName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill name, email and message");
      return;
    }
    try {
      setSubmitting(true);
      await sendRequest({ name, email, message, videoName: videoName || undefined });
      setSent(true);
      toast.success("Request sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setVideoName("");
      setMessage("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to send");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSent(false), 1200);
    }
  };

  return (
    <div className="container mx-auto container-px py-8">
      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold inline-flex items-center gap-2"
      >
        <MailPlus className="h-6 w-6 text-primary" /> Pilotuuu Dinchu Dinchuu...
      </motion.h1>

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-6 max-w-xl space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium inline-flex items-center gap-1">
              <User className="h-4 w-4" /> Name
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium inline-flex items-center gap-1">
              <AtSign className="h-4 w-4" /> Email
            </label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium inline-flex items-center gap-1">
            <VideoIcon className="h-4 w-4" /> Specific Video (optional)
          </label>
          <Input value={videoName} onChange={(e) => setVideoName(e.target.value)} placeholder="e.g., X/Instagram template name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> Message
          </label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe the video you want" rows={6} required />
        </div>
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto inline-flex items-center gap-2">
            <motion.span
              initial={false}
              animate={submitting ? { opacity: 0.6 } : { opacity: 1 }}
              className="inline-flex items-center gap-2"
            >
              {submitting && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              )}
              {sent ? "Sent!" : submitting ? "Sending..." : "Send Request"}
              <Send className="h-4 w-4" />
            </motion.span>
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
}

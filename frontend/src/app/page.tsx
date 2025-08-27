"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center container-px"
      >
        {/* Circular gradient hero image container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/30 p-[3px] shadow-lg sm:h-56 sm:w-56"
        >
          <div className="relative h-full w-full rounded-full bg-background/70 backdrop-blur-sm">
            {/* Optional image: replace /hero.png with your transparent PNG */}
            <Image
              src="/hero.png"
              alt="Hero"
              fill
              sizes="(max-width: 640px) 160px, 224px"
              className="rounded-full object-contain p-3"
            />
          </div>
        </motion.div>
        <motion.h1
          className="text-4xl font-extrabold tracking-tight sm:text-6xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Telugu Video Templates
        </motion.h1>
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          Download your X / instagram favourite telugu video templates for free and you can also upload your favourite video templates and contribute to the community.
        </motion.p>
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link href="/home">
            <Button size="lg" className="inline-flex items-center gap-2">
              Let&apos;s Go <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* background animated blobs */}
      <motion.div
        className="pointer-events-none absolute -z-10 h-[60vh] w-[60vh] rounded-full bg-primary/10 blur-3xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{ top: "10%", left: "5%" }}
      />
      <motion.div
        className="pointer-events-none absolute -z-10 h-[60vh] w-[60vh] rounded-full bg-secondary/20 blur-3xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{ bottom: "5%", right: "10%" }}
      />
    </div>
  );
}

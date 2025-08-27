"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Upload as UploadIcon, Hand, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const linkClass = (href: string) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      pathname === href ? "text-primary" : "text-muted-foreground"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between container-px">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Home">
          <Image
            src="/logo.png"
            alt="Telugu Template Videos"
            width={48}
            height={48}
            className="h-18 w-18 object-contain"
            priority
          />
          <span className="sr-only">Telugu Template Videos</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className={linkClass("/")}>Landing</Link>
          <Link href="/home" className={linkClass("/home")}>
            <span className="inline-flex items-center gap-1"><Home className="h-4 w-4" /> Home</span>
          </Link>
          <Link href="/upload" className={linkClass("/upload")}>
            <span className="inline-flex items-center gap-1"><UploadIcon className="h-4 w-4" /> Upload</span>
          </Link>
          <Link href="/request" className={linkClass("/request")}>
            <span className="inline-flex items-center gap-1"><Hand className="h-4 w-4" /> Request</span>
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle menu"
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden hover:bg-accent"
          onClick={() => setOpen((o) => !o)}
        >
          <AnimatePresence initial={false} mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden border-t bg-background/95 backdrop-blur"
          >
            <motion.ul
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
                closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              }}
              className="container mx-auto container-px py-3 space-y-2"
            >
              <motion.li variants={{ open: { y: 0, opacity: 1 }, closed: { y: -8, opacity: 0 } }}>
                <Link onClick={() => setOpen(false)} href="/" className={linkClass("/")}>
                  <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> Landing</span>
                </Link>
              </motion.li>
              <motion.li variants={{ open: { y: 0, opacity: 1 }, closed: { y: -8, opacity: 0 } }}>
                <Link onClick={() => setOpen(false)} href="/home" className={linkClass("/home")}>
                  <span className="inline-flex items-center gap-2"><Home className="h-4 w-4" /> Home</span>
                </Link>
              </motion.li>
              <motion.li variants={{ open: { y: 0, opacity: 1 }, closed: { y: -8, opacity: 0 } }}>
                <Link onClick={() => setOpen(false)} href="/upload" className={linkClass("/upload")}>
                  <span className="inline-flex items-center gap-2"><UploadIcon className="h-4 w-4" /> Upload</span>
                </Link>
              </motion.li>
              <motion.li variants={{ open: { y: 0, opacity: 1 }, closed: { y: -8, opacity: 0 } }}>
                <Link onClick={() => setOpen(false)} href="/request" className={linkClass("/request")}>
                  <span className="inline-flex items-center gap-2"><Hand className="h-4 w-4" /> Request</span>
                </Link>
              </motion.li>
              <motion.li variants={{ open: { y: 0, opacity: 1 }, closed: { y: -8, opacity: 0 } }} className="pt-2">
                <ThemeToggle />
              </motion.li>
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

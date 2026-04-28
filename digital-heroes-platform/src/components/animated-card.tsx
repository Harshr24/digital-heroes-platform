"use client";

import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export function AnimatedCard({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-xl border border-white/10 bg-zinc-900/70 p-4 ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

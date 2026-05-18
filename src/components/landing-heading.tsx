"use client";

import * as React from "react";
import { motion } from "framer-motion";
import SplitText from "./split-text";

export function LandingHeading() {
  return (
    <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
      <SplitText
        text="Audit-grade clarity for "
        className="text-foreground pb-2"
        tag="span"
        delay={50}
        duration={0.9}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0}
        rootMargin="0px"
        textAlign="center"
      />
      <motion.span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--purple), var(--orange))",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 1.2 }}
      >
        every expense.
      </motion.span>
    </h1>
  );
}

"use client";

import { useEffect, useState } from "react";
import { incrementView } from "@/app/maddahi/[slug]/actions";

export default function ViewCounter({ postId }) {
  const [currentViews, setCurrentViews] = useState(0);

  useEffect(() => {
    const updateAndFetchView = async () => {
      try {
        const newViewCount = await incrementView(postId);
        setCurrentViews(parseInt(newViewCount));
      } catch (error) {
        console.error("Failed to increment or fetch view:", error);
        setCurrentViews(0);
      }
    };
    updateAndFetchView();
  }, [postId]);

  return (
    <h3 className="font-mono text-sm text-[var(--foreground-muted)]">
      {(parseFloat(currentViews) || 0).toLocaleString("fa-IR")} بازدید
    </h3>
  );
}

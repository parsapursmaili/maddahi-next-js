"use client";

import NextTopLoader from "nextjs-toploader";

const TopLoader = () => {
  return (
    <NextTopLoader
      color="var(--accent-primary)" // استفاده از رنگ اصلی
      initialPosition={0.08}
      crawlSpeed={200}
      height={4}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px var(--accent-crystal-highlight), 0 0 5px var(--accent-crystal-highlight)" // استفاده از رنگ هایلایت برای درخشش
    />
  );
};

export default TopLoader;

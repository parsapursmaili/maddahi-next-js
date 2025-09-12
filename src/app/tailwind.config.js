// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // مسیر فایل‌هات رو درست بذار
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0a0a0a",
          secondary: "#171717",
          tertiary: "#262626",
        },
        foreground: {
          primary: "#f5f6f7",
          secondary: "#a3a3a3",
          muted: "#525252",
        },
        accent: {
          primary: "#00b4a0", // teal عمیق
          crystal: "#a3fff4", // highlight روشن
        },
        border: {
          primary: "#262626",
          secondary: "#333333",
        },
        feedback: {
          success: "#10b981",
          error: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "Vazirmatn", // یا فونتی که خودت می‌خوای
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

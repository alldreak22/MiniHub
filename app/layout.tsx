import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import DebugMenu from "@/components/DebugMenu";
import { VISUAL_THEME_STORAGE_KEY } from "@/lib/storage";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Mini Hub | Minigames",
    template: "%s | Mini Hub",
  },
  description: "Um lugar para encontrar seus próximos minigames favoritos.",
};

const themeScript = `try{const value=localStorage.getItem(${JSON.stringify(VISUAL_THEME_STORAGE_KEY)});document.documentElement.dataset.theme=value==="light"||value==="dark"||value==="system"?value:"system"}catch{document.documentElement.dataset.theme="system"}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-text-primary antialiased">
        {process.env.NODE_ENV === "development" && <DebugMenu />}
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vinicius Provas",
  description: "Sistema de criação, gerenciamento e aplicação de provas",
};

const scriptTema = `
  try {
    var tema = localStorage.getItem('tema');
    if (tema === 'escuro') document.documentElement.classList.add('dark');
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Aplica o tema salvo antes da primeira pintura, para não piscar o tema errado. */}
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.trim() ??
  "https://google-tag-manager-mcp.vercel.app";

export const metadata: Metadata = {
  title: "Google Tag Manager MCP",
  description: "MCP server connecting Claude to Google Tag Manager",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    images: [`${BASE_URL}/icon.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "Marano Eye Care | Equipment Portal",
  description: "Report broken or low-stock equipment at Marano Eye Care",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

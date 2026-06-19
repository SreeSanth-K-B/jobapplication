import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HireHunt — AI-Powered Job Application Tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

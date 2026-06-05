import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApplyTrack — AI-Powered Job Application Tracker',
  description: 'Track your job applications, get AI coaching, and sync with Gmail. Built for modern job seekers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading', display: 'swap' })

export const metadata: Metadata = {
  title: 'MCE Silver Reunion — 1997–2001 Batch',
  description: '25 Years of Friendship, Innovation & Memories. Mookambigai College of Engineering Alumni Portal.',
  openGraph: {
    title: 'MCE Silver Reunion — Class of 2001',
    description: '25 Years of Friendship, Innovation & Memories.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-[#0a0e1a] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}

import './globals.css'

export const metadata = {
  title: 'CargoLoop Intelligence',
  description: 'Lane analytics and freight intelligence — powered by CargoLoop',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

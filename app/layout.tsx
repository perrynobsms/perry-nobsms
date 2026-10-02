export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f5f5f5', fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  )
}

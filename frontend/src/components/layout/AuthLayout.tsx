/**
 * Layout wrapper for authentication pages.
 * Provides the dark background and centered content.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080A0F]">
      {children}
    </div>
  )
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <div className="min-h-screen bg-gradient-to-tr from-rose-100 to-teal-100">{children}</div>
}

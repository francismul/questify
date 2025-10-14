import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}

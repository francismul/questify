import { Suspense } from "react";
import { AuthPageClient } from "@/components/auth/AuthPageClient";
import { AuthLoadingSkeleton } from "@/components/auth/AuthLoadingSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Questify",
  description:
    "Sign in to your Questify account to continue your learning journey",
};

// Force dynamic rendering for authentication pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingSkeleton />}>
      <AuthPageClient mode="login" />
    </Suspense>
  );
}

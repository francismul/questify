import { Suspense } from "react";
import { AuthPageClient } from "@/components/auth/AuthPageClient";
import { AuthLoadingSkeleton } from "@/components/auth/AuthLoadingSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Questify",
  description: "Create your Questify account and start your learning adventure",
};

// Force dynamic rendering for authentication pages
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthLoadingSkeleton />}>
      <AuthPageClient mode="register" />
    </Suspense>
  );
}

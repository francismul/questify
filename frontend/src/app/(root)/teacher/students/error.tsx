"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Teacher dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            We encountered an error while loading the teacher dashboard.
            This might be a temporary issue.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-muted p-4 rounded-lg text-left">
            <p className="text-sm font-medium text-foreground mb-2">Error Details:</p>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = "/dashboard"}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
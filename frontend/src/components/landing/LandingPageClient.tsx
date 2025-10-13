"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "../ui/Button";

export function LandingPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90">
      <div className="container mx-auto px-4 py-16">
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-primary rounded-full" />
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              Questify
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="accent">Get Started</Button>
            </Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
              Transform Your Learning
              <br />
              <span className="text-accent">Journey Today</span>
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students and teachers using Questify to make
              learning more engaging, interactive, and effective.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" variant="accent" className="text-lg">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

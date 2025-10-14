"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  alt: string;
  title?: string;
}

export function ImageModal({ isOpen, onClose, imageSrc, alt, title }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative max-w-2xl max-h-[90vh] w-full">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Image container */}
              <div className="bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
                {title && (
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white text-center">{title}</h3>
                  </div>
                )}
                <div className="relative">
                  <Image
                    src={imageSrc}
                    alt={alt}
                    width={800}
                    height={800}
                    className="w-full h-auto max-h-[80vh] object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
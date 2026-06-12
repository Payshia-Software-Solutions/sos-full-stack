"use client";

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const Preloader = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This effect runs only once on initial load
    if (typeof window !== 'undefined' && window.sessionStorage.getItem('preloaderShown')) {
        setLoading(false);
        return;
    }

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            setLoading(false);
            if (typeof window !== 'undefined') {
                window.sessionStorage.setItem('preloaderShown', 'true');
            }
          }, 500); // fade out animation
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    return () => {
      clearInterval(progressTimer);
    };
  }, []);

  if (!loading && progress < 100) return null;


  return (
    <div
      className={cn(
        "fixed top-0 left-0 w-full z-[200] transition-opacity duration-500",
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <Progress value={progress} className="h-1 w-full rounded-none bg-primary/20" />
    </div>
  );
};

export default Preloader;

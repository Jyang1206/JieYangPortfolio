"use client";

import { Canvas } from "@react-three/fiber";
import React, { Suspense, useEffect, useState, type ReactNode } from "react";

type ThreeCanvasShellProps = {
  children: ReactNode;
  fallback: ReactNode;
  label: string;
  active?: boolean;
};

export function ThreeCanvasShell({ children, fallback, label, active = true }: ThreeCanvasShellProps) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setWebglAvailable(Boolean(gl));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (webglAvailable === false) {
    return <>{fallback}</>;
  }

  if (webglAvailable === null) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-500">
        Initializing 3D view
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={fallback}>
      <Canvas
        aria-label={label}
        dpr={[1, 2]}
        frameloop={active ? "always" : "demand"}
        camera={{ position: [4.5, 3.2, 5.4], fov: 42 }}
        shadows
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

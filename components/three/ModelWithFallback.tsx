"use client";

import { Clone, useGLTF } from "@react-three/drei";
import React, { Suspense, type ReactNode } from "react";

type ModelWithFallbackProps = {
  modelPath: string;
  fallback: ReactNode;
};

export function ModelWithFallback({ modelPath, fallback }: ModelWithFallbackProps) {
  if (!modelPath) {
    return fallback;
  }

  return (
    <ModelErrorBoundary key={modelPath} fallback={fallback}>
      <Suspense fallback={fallback}>
        <ModelInner modelPath={modelPath} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

function ModelInner({ modelPath }: { modelPath: string }) {
  const gltf = useGLTF(modelPath);
  return <Clone object={gltf.scene} />;
}

class ModelErrorBoundary extends React.Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
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

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <main className="app-loading-state flex min-h-32 items-center justify-center" aria-live="polite" aria-busy="true">
      <p>{message}</p>
    </main>
  );
}

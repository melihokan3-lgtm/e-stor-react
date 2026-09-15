interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <main className="app-loading-state" aria-live="polite" aria-busy="true">
      <p>{message}</p>
    </main>
  );
}

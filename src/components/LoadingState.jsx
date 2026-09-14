export default function LoadingState({ message = "Loading..." }) {
  return (
    <main className="app-loading-state" aria-live="polite" aria-busy="true">
      <p>{message}</p>
    </main>
  );
}

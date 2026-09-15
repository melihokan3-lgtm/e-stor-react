interface FeedbackStateProps {
  message: string;
  tone?: "empty" | "error";
}

export function EmptyState({ message }: FeedbackStateProps) {
  return <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-500">{message}</p>;
}

export function ErrorState({ message }: FeedbackStateProps) {
  return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{message}</p>;
}

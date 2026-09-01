interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({
  title = "No data found",
  message = "There is no information to display.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="common-empty-state">
      <div className="common-empty-icon" aria-hidden="true">
        ∅
      </div>

      <h3>{title}</h3>

      <p>{message}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          className="common-empty-action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;

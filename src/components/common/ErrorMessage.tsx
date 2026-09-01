interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorMessage({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="common-error-message" role="alert">
      <div className="common-error-icon" aria-hidden="true">
        !
      </div>

      <div className="common-error-content">
        <h3>Unable to load data</h3>

        <p>{message}</p>

        {onRetry && (
          <button
            type="button"
            className="common-error-retry"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;

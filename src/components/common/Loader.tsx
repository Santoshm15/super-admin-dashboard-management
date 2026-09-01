interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

function Loader({ message = "Loading...", fullScreen = false }: LoaderProps) {
  return (
    <div
      className={`common-loader ${fullScreen ? "common-loader-fullscreen" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="common-loader-spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default Loader;

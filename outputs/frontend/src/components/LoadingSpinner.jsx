export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-12 h-12" : "w-8 h-8";
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizeClass} border-4 border-cit-blue border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
}

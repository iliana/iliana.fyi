export default function Prose({ className, noMargins, children }) {
  return (
    <div
      className={`prose dark:prose-invert prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:font-medium lg:prose-lg xl:prose-xl 2xl:prose-2xl ${
        noMargins ? "" : "my-5 lg:my-6 xl:my-7 2xl:my-8"
      } ${className ?? ""}`.trim()}
    >
      {children}
    </div>
  );
}

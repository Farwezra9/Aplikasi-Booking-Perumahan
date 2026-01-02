interface ComponentCardProps {
  children: React.ReactNode;
  className?: string; // Additional custom classes
  desc?: string; // Optional description
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  children,
  className = "",
  desc,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      {desc && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        </div>
      )}

      {/* Card Body */}
      <div className={`px-4 py-3 ${desc ? "" : "pt-3"}`}>
        {children}
      </div>
    </div>
  );
};

export default ComponentCard;

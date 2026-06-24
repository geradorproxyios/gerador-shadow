export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "sm" ? 36 : size === "lg" ? 56 : 44;
  const textClass = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Shadow Logo"
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: "20%",
          flexShrink: 0,
          objectFit: "cover",
        }}
      />
      <div>
        <div className={`font-extrabold leading-tight ${textClass} text-gradient`}>
          SHADOW<br />OFICIAL
        </div>
      </div>
    </div>
  );
}

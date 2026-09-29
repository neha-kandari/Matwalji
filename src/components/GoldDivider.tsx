interface Props {
  className?: string;
}

export default function GoldDivider({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(to right, transparent, #C7A15B)" }}
      />
      <div
        className="w-1.5 h-1.5 rotate-45 flex-shrink-0"
        style={{ background: "#C7A15B" }}
      />
      <div
        className="flex-1 h-px"
        style={{ background: "linear-gradient(to left, transparent, #C7A15B)" }}
      />
    </div>
  );
}

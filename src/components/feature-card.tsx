export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 lg:p-6 transition-shadow hover:shadow-md">
      <div className="mb-3">{icon}</div>
      <h3 className="text-h3 font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-body-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

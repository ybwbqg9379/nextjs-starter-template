import { cn } from '@/lib/utils';

export function PageCenter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center px-4 lg:px-6 text-center',
        className
      )}
    >
      {children}
    </div>
  );
}

import { PageCenter } from '@/components/ui/page-center';

export default function Loading() {
  return (
    <PageCenter>
      <div
        role="status"
        className="size-spinner animate-spin rounded-full border-4 border-muted border-t-primary"
      />
    </PageCenter>
  );
}

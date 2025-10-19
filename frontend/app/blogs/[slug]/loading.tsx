import { BlogLoading } from '@/components/blogs/BlogLoading';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlogLoading />
      </div>
    </div>
  );
}
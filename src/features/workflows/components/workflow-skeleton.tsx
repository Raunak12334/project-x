import { Card, CardContent } from "@/components/ui/card";

export const WorkflowSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse border-zinc-200">
          <CardContent className="p-6 space-y-4">
            <div className="h-6 w-3/4 bg-zinc-100 rounded" />
            <div className="h-4 w-1/2 bg-zinc-100 rounded" />
            <div className="flex justify-between pt-4">
              <div className="h-4 w-20 bg-zinc-100 rounded" />
              <div className="h-4 w-12 bg-zinc-100 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
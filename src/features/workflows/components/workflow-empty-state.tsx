import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WorkflowEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl bg-white/50 space-y-4">
      <div className="p-4 bg-zinc-100 rounded-full">
        <Zap className="size-10 text-zinc-400" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-zinc-900">No workflows found</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Get started by creating your first multi-agent workflow to automate your tasks.
        </p>
      </div>
      <Button className="bg-zinc-900 text-white gap-2">
        <Plus className="size-4" />
        Create Workflow
      </Button>
    </div>
  );
};
"use client";

import { useCreateWorkflowFromTemplate } from "@/features/workflows/hooks/use-workflows";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ZapIcon, Loader2Icon } from "lucide-react";

interface TemplateCtaProps {
  templateId: string;
  templateSlug: string;
  isLoggedIn: boolean;
}

export function TemplateCta({ templateId, templateSlug, isLoggedIn }: TemplateCtaProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const { mutate: createWorkflow } = useCreateWorkflowFromTemplate();

  const handleUseTemplate = () => {
    if (!isLoggedIn) {
      router.push(`/sign-in?callbackUrl=/templates/${templateSlug}`);
      return;
    }

    setIsPending(true);
    createWorkflow(
      { templateId },
      {
        onSuccess: (data) => {
          router.push(`/workflows/${data.id}`);
        },
        onError: () => {
          setIsPending(false);
        },
      }
    );
  };

  return (
    <Button 
      size="lg" 
      onClick={handleUseTemplate} 
      disabled={isPending}
      className="w-full md:w-auto px-8 rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2"
    >
      {isPending ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <ZapIcon className="size-5 fill-current" />
      )}
      {isLoggedIn ? "Use this Template" : "Login to use Template"}
    </Button>
  );
}

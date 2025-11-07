"use client";

import { Button } from "@heroui/button";
import { createMetaState } from "@/actions/meta";
import { useRouter } from "next/navigation";
import { createMetaOAuthUrl } from "@/actions/meta";

export default function OnboardingLayout() {
  const router = useRouter();

  const handleMetaRedirect = async () => {
    const state = await createMetaState();
    const url = await createMetaOAuthUrl(state);
    router.push(url);
  };

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Onboarding</h1>
        <p className="text-sm text-muted-foreground">
          Connect your accounts and get started
        </p>
      </div>
      <div>
        <Button onPress={handleMetaRedirect}>Connect Meta</Button>
      </div>
    </div>
  );
}


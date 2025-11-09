import MetaConnection from "@/components/onboarding/MetaConnection";
import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export default async function MetaOnboardingPage() {
  const user = await stackServerApp.getUser({});

  if (!user) {
    redirect("/sign-in");
  }
  return (
    <div className="w-full h-full px-6">
      <MetaConnection />
    </div>
  );
}

import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";
import SelectForm from "@/components/onboarding/SelectForm";

export default async function SelectFormPage() {
  const user = await stackServerApp.getUser({});
  const team = await user?.listTeams();

  if (!user) {
    redirect("/sign-in");
  }
  if (!team || team.length === 0) {
    redirect("/sign-in");
  }
  return (
    <div className="w-full h-full px-6">
      <SelectForm teamId={team[0]?.id ?? ""} />
    </div>
  );
}

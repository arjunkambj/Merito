import { stackServerApp } from "@/stack/server";
import { redirect } from "next/navigation";

export default async function InviteTeamsPage() {
  const user = await stackServerApp.getUser({});

  if (!user) {
    redirect("/sign-in");
  }
  return <div>InviteTeamsPage</div>;
}

import Logo from "@/components/layout/Logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen grid grid-cols-5">
      <div className="col-span-1 h-full min-h-dvh border-r border-default-200">
        <div className="space-y-6 py-6 px-6">
          <Logo />
        </div>
      </div>
      <main className="col-span-3 px-6 py-6">{children}</main>
    </div>
  );
}

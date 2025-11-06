import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex">
      <div className="w-full h-full flex justify-center items-center">
        {children}
      </div>
      <div className="w-full min-h-full flex justify-center items-center p-6">
        <div className="w-full h-full flex flex-col justify-center rounded-4xl bg-default-100 p-12">
          <div className="max-w-xl space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Lorem ipsum dolor
                <span className="block mt-2">sit amet</span>
              </h1>
              <p className="text-xl md:text-2xl text-default-600 font-medium leading-relaxed">
                Consectetur adipiscing{" "}
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  elit
                </span>{" "}
                sed do eiusmod tempor
              </p>
            </div>
            <div className="pt-12 border-t border-default-200">
              <p className="text-sm text-default-500">
                © {new Date().getFullYear()} Meyoo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

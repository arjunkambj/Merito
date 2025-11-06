import Navbar from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { ThemeSwitch } from "@/components/layout/ThemeSwitch";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full items-center">
      <Navbar />
      {children}
      <Footer />
      <ThemeSwitch />
    </div>
  );
}

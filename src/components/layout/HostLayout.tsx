import { ReactNode } from "react";
import Navbar from "./Navbar";
import HostNav from "./HostNav";

interface HostLayoutProps {
  children: ReactNode;
}

const HostLayout = ({ children }: HostLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HostNav />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
};

export default HostLayout;


import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Coins, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const BecomeHost = () => {
    const navigate = useNavigate();
    const { requestHostRole, user } = useAuth();

    const handleStartHosting = async () => {
        if (!user) {
            navigate("/auth");
            return;
        }

        try {
            const { error } = await requestHostRole();
            if (error) {
                toast.error("Failed to process request. Please try again.");
            } else {
                toast.success("Welcome aboard! You are now a host.");
                navigate("/host");
            }
        } catch (err) {
            console.error(err);
            toast.error("An unexpected error occurred.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-grow pt-24 pb-12">
                <div className="container mx-auto px-4">
                    {/* Hero Section */}
                    <div className="max-w-4xl mx-auto text-center mb-16 space-y-6 animate-fade-up">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            Earn money as a <span className="text-primary">Humbri Host</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Unlock a new income stream by renting out your space. Join thousands of hosts welcoming guests for hourly stays, daycations, and overnight trips.
                        </p>
                        <div className="flex justify-center pt-4">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-6 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                                onClick={handleStartHosting}
                            >
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Coins className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Maximize Earnings</h3>
                            <p className="text-muted-foreground">
                                Set your own prices for hourly or nightly stays. Optimize your occupancy with flexible booking options.
                            </p>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Host with Confidence</h3>
                            <p className="text-muted-foreground">
                                Comprehensive protection for your property. Verified guests and 24/7 support ensure peace of mind.
                            </p>
                        </div>

                        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                <Calendar className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Complete Control</h3>
                            <p className="text-muted-foreground">
                                Manage availability, house rules, and guest interactions on your terms. Hosting that fits your life.
                            </p>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="max-w-3xl mx-auto bg-gradient-primary rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                        <h2 className="text-3xl font-bold mb-4 text-white">Ready to start your journey?</h2>
                        <p className="text-white/90 mb-8 max-w-lg mx-auto">
                            Setting up your listing only takes a few minutes. We'll guide you through every step.
                        </p>
                        <Button
                            size="lg"
                            variant="secondary"
                            className="font-bold text-primary hover:bg-white"
                            onClick={handleStartHosting}
                        >
                            Continue as Host
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BecomeHost;

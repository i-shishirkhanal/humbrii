import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CheckCircle2, DollarSign, Globe, Shield } from "lucide-react";

const HostInfo = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-hero opacity-50" />
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up">
                        Become a <span className="text-primary">Humbri Host</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                        Unlock the potential of your property. Earn extra income, meet travelers from around the world, and be part of Nepal's growing hospitality network.
                    </p>
                    <div className="flex justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                        <Link to="/host">
                            <Button size="lg" className="text-lg px-8">
                                Start Hosting
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-card/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Why Host on Humbri?</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Earn Extra Income</h3>
                            <p className="text-muted-foreground">Turn your extra space into a steady stream of income. Set your own prices and schedule.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Reach Global Travelers</h3>
                            <p className="text-muted-foreground">Connect with guests from all over the world and share your local culture.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                            <p className="text-muted-foreground">Get paid securely and on time directly to your bank account or digital wallet.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Host with Confidence</h3>
                            <p className="text-muted-foreground">24/7 support, guest verification, and host protection programs to keep you safe.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="rounded-3xl bg-primary/5 border border-primary/10 p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <h2 className="text-3xl font-bold mb-4 relative z-10">Ready to get started?</h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto relative z-10">
                            Listing your property is free, easy, and takes just a few minutes.
                        </p>
                        <Link to="/host" className="relative z-10">
                            <Button size="lg" variant="default">
                                Create Your Listing
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HostInfo;

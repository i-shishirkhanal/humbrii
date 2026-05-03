import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">2. User Accounts</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">3. Booking and Payments</h2>
                        <div className="text-muted-foreground leading-relaxed space-y-2">
                            <p>About bookings and payments:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>You agree to pay all charges at the prices then in effect for your purchases.</li>
                                <li>We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to: product or service availability, errors in the description or price of the product or service, error in your order or other reasons.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">4. Host Obligations</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Hosts are responsible for their listings and must provide accurate information. Humbri is not responsible for the condition of the properties listed.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            The Service and its original content, features and functionality are and will remain the exclusive property of Humbri and its licensors.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">6. Termination</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">7. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about these Terms, please contact us at:{" "}
                            <a href="mailto:support@humbri.com" className="text-primary hover:underline">support@humbri.com</a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;

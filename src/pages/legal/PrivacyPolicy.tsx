import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">1. Introduction</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Welcome to Humbri. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
                        <div className="text-muted-foreground leading-relaxed space-y-2">
                            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                                <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                <li><strong>Financial Data:</strong> includes bank account and payment card details.</li>
                                <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">4. Data Security</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">5. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at:{" "}
                            <a href="mailto:support@humbri.com" className="text-primary hover:underline">support@humbri.com</a>
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;

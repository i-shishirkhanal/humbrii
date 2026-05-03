import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-xl font-semibold">Refund Policy</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">1. Overview</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            At Humbri, we strive to ensure a fair experience for both guests and hosts. This Refund Policy outlines the conditions under which refunds are granted for hourly, daily (Daycation), and full-stay bookings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">2. Cancellation by Guest</h2>
                        <div className="space-y-4 text-muted-foreground">
                            <h3 className="text-lg font-medium text-foreground">Hourly & Daycation Bookings</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Free Cancellation:</strong> Guests can cancel for free up to 24 hours before the check-in time.</li>
                                <li><strong>Partial Refund:</strong> Cancellations made between 24 hours and 1 hour before check-in may be eligible for a 50% refund, excluding service fees.</li>
                                <li><strong>No Refund:</strong> Cancellations made less than 1 hour before check-in are not eligible for a refund.</li>
                            </ul>

                            <h3 className="text-lg font-medium text-foreground mt-6">Full Stay (Overnight) Bookings</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Flexible:</strong> Full refund for cancellations made at least 5 days prior to check-in.</li>
                                <li><strong>Moderate:</strong> Full refund for cancellations made within 48 hours of booking, if the check-in date is at least 14 days away. 50% refund for cancellations made up to 7 days before check-in.</li>
                                <li><strong>Strict:</strong> 50% refund for cancellations made at least 14 days prior to check-in. No refunds for cancellations made within 14 days of check-in.</li>
                            </ul>
                            <p className="mt-2 text-sm italic">
                                *The specific cancellation policy (Flexible, Moderate, or Strict) is selected by the Host and displayed on the property listing page.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">3. Cancellation by Host</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If a Host cancels a confirmed booking, the Guest will receive a <strong>full refund</strong> of the total fees paid, including service fees. We may also assist the Guest in finding alternative accommodation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">4. Extenuating Circumstances</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            In rare cases, cancellations due to extenuating circumstances (e.g., natural disasters, government restrictions, serious illness) may be eligible for a full refund regardless of the cancellation policy. Documentation may be required.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">5. Issues During Stay</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you encounter a significant issue during your stay (e.g., property not as described, safety issues, lack of essential amenities), please contact us within 24 hours of check-in. We will investigate and may offer a partial or full refund depending on the severity of the issue.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">6. Processing Refunds</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Refunds will be processed to the original payment method used for the booking. Please allow 5-10 business days for the refund to reflect in your account, depending on your bank or payment provider.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">7. Contact Us</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you have any questions about this Refund Policy, please contact our support team at <a href="mailto:support@humbri.com" className="text-primary hover:underline">support@humbri.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;

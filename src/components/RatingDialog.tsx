import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  bookingId: string;
  onSubmit: (rating: number, review: string) => void;
}

const RatingDialog = ({
  isOpen,
  onClose,
  propertyName,
  bookingId,
  onSubmit,
}: RatingDialogProps) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    onSubmit(rating, review);
    setRating(0);
    setReview("");
    onClose();
    toast.success("Thank you for your rating!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Stay</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground">
              How was your experience at <span className="font-semibold text-foreground">{propertyName}</span>?
            </p>
          </div>
          
          {/* Star Rating */}
          <div className="flex flex-col items-center py-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating)
                        ? "text-primary fill-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {rating === 0
                ? "Select your rating"
                : rating === 1
                ? "Poor"
                : rating === 2
                ? "Fair"
                : rating === 3
                ? "Good"
                : rating === 4
                ? "Very Good"
                : "Excellent"}
            </p>
          </div>

          {/* Review */}
          <div>
            <Label htmlFor="review">Write a review (optional)</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with other travelers..."
              className="mt-1"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Rating</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;

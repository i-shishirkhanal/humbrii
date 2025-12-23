import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Star, Search, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Mock ratings data
const mockRatings = [
  {
    id: "1",
    propertyName: "Himalayan View Resort",
    userName: "John Doe",
    rating: 5,
    isVisible: true,
    createdAt: "2024-12-20",
  },
  {
    id: "2",
    propertyName: "Heritage Boutique Hotel",
    userName: "Jane Smith",
    rating: 4,
    isVisible: true,
    createdAt: "2024-12-19",
  },
  {
    id: "3",
    propertyName: "Lakeside Paradise Villa",
    userName: "Mike Wilson",
    rating: 3,
    isVisible: false,
    createdAt: "2024-12-18",
  },
  {
    id: "4",
    propertyName: "Mountain Retreat",
    userName: "Sarah Johnson",
    rating: 5,
    isVisible: true,
    createdAt: "2024-12-17",
  },
  {
    id: "5",
    propertyName: "Himalayan View Resort",
    userName: "Tom Brown",
    rating: 2,
    isVisible: true,
    createdAt: "2024-12-16",
  },
];

const AdminRatings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratings, setRatings] = useState(mockRatings);
  const [editingRating, setEditingRating] = useState<typeof mockRatings[0] | null>(null);
  const [editedRating, setEditedRating] = useState(0);

  const filteredRatings = ratings.filter(
    (rating) =>
      rating.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating = (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1);
  const visibleRatings = ratings.filter((r) => r.isVisible).length;

  const toggleVisibility = (id: string) => {
    setRatings(
      ratings.map((r) =>
        r.id === id ? { ...r, isVisible: !r.isVisible } : r
      )
    );
    toast.success("Rating visibility updated");
  };

  const openEditDialog = (rating: typeof mockRatings[0]) => {
    setEditingRating(rating);
    setEditedRating(rating.rating);
  };

  const saveRating = () => {
    if (!editingRating) return;
    setRatings(
      ratings.map((r) =>
        r.id === editingRating.id
          ? { ...r, rating: editedRating }
          : r
      )
    );
    setEditingRating(null);
    toast.success("Rating updated successfully");
  };

  const deleteRating = (id: string) => {
    setRatings(ratings.filter((r) => r.id !== id));
    toast.success("Rating deleted successfully");
  };

  const renderStars = (rating: number, interactive = false, onChange?: (value: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "text-primary fill-primary"
                : "text-muted-foreground"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ratings Management</h1>
          <p className="text-muted-foreground">View and manage property ratings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{ratings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{averageRating}</p>
                <Star className="w-5 h-5 text-primary fill-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Visible Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{visibleRatings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hidden Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{ratings.length - visibleRatings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Ratings</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search ratings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRatings.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell className="font-medium">{rating.propertyName}</TableCell>
                    <TableCell>{rating.userName}</TableCell>
                    <TableCell>{renderStars(rating.rating)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rating.isVisible}
                        onCheckedChange={() => toggleVisibility(rating.id)}
                      />
                    </TableCell>
                    <TableCell>{rating.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(rating)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteRating(rating.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingRating} onOpenChange={() => setEditingRating(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Rating</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Property</Label>
                <p className="text-muted-foreground">{editingRating?.propertyName}</p>
              </div>
              <div>
                <Label>User</Label>
                <p className="text-muted-foreground">{editingRating?.userName}</p>
              </div>
              <div>
                <Label>Rating</Label>
                <div className="mt-2">
                  {renderStars(editedRating, true, setEditedRating)}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRating(null)}>
                Cancel
              </Button>
              <Button onClick={saveRating}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminRatings;

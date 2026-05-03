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
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";

// Mock ratings data


const AdminRatings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRating, setEditingRating] = useState<any | null>(null);
  const [editedRating, setEditedRating] = useState(0);

  const { data: ratings = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-ratings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_ratings")
        .select(`
          *,
          properties (name),
          profiles (full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((r: any) => ({
        id: r.id,
        propertyName: r.properties?.name || "Unknown Property",
        userName: r.profiles?.full_name || "Anonymous",
        rating: r.rating,
        review: r.review, // Added review content
        isVisible: r.is_visible,
        createdAt: format(new Date(r.created_at), "yyyy-MM-dd"),
      }));
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from("property_ratings")
        .update({ is_visible: isVisible })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rating visibility updated");
      refetch();
    },
    onError: () => toast.error("Failed to update visibility"),
  });

  const updateRatingMutation = useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: number }) => {
      const { error } = await supabase
        .from("property_ratings")
        .update({ rating: rating })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rating updated successfully");
      setEditingRating(null);
      refetch();
    },
    onError: () => toast.error("Failed to update rating"),
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("property_ratings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rating deleted successfully");
      refetch();
    },
    onError: () => toast.error("Failed to delete rating"),
  });

  const filteredRatings = ratings.filter(
    (rating: any) =>
      rating.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating = ratings.length
    ? (ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  const visibleRatings = ratings.filter((r: any) => r.isVisible).length;

  const toggleVisibility = (id: string, currentStatus: boolean) => {
    toggleVisibilityMutation.mutate({ id, isVisible: !currentStatus });
  };

  const saveRating = () => {
    if (!editingRating) return;
    updateRatingMutation.mutate({ id: editingRating.id, rating: editedRating });
  };

  const deleteRating = (id: string) => {
    if (confirm("Are you sure you want to delete this rating?")) {
      deleteRatingMutation.mutate(id);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (value: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading ratings...</TableCell>
                  </TableRow>
                ) : filteredRatings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">No ratings found</TableCell>
                  </TableRow>
                ) : (
                  filteredRatings.map((rating: any) => (
                    <TableRow key={rating.id}>
                      <TableCell className="font-medium">{rating.propertyName}</TableCell>
                      <TableCell>{rating.userName}</TableCell>
                      <TableCell>{renderStars(rating.rating)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={rating.isVisible}
                          onCheckedChange={() => toggleVisibility(rating.id, rating.isVisible)}
                        />
                      </TableCell>
                      <TableCell>{rating.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingRating(rating);
                              setEditedRating(rating.rating);
                            }}
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
                  ))
                )}
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

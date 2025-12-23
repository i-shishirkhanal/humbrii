import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Settings, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const mockProperties = [
  {
    id: "1",
    name: "Himalayan View Resort",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    status: "active",
    totalRooms: 12,
    occupancy: 75,
    pendingBookings: 3,
    revenue: "NPR 125,000",
  },
  {
    id: "2",
    name: "Lakeside Villa",
    location: "Pokhara, Nepal",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    status: "active",
    totalRooms: 5,
    occupancy: 60,
    pendingBookings: 1,
    revenue: "NPR 45,000",
  },
];

const HostProperties = () => {
  return (
    <DashboardLayout role="host">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Properties</h1>
            <p className="text-muted-foreground mt-1">Manage your listed properties</p>
          </div>
          <Link to="/host/properties/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {mockProperties.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-medium transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === "active" 
                        ? "bg-success/10 text-success" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rooms</p>
                      <p className="font-semibold text-card-foreground">{property.totalRooms}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Occupancy</p>
                      <p className="font-semibold text-card-foreground">{property.occupancy}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending</p>
                      <p className="font-semibold text-card-foreground">{property.pendingBookings}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue (Month)</p>
                      <p className="font-semibold text-card-foreground">{property.revenue}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-3 h-3 mr-1" />
                      Settings
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostProperties;

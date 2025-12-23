import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/cards/StatCard";
import { Building2, Calendar, Users, TrendingUp, Plus, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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
  },
];

const upcomingCheckIns = [
  { guestName: "Ram Sharma", property: "Himalayan View Resort", checkIn: "Dec 24, 2024", roomType: "Deluxe" },
  { guestName: "Sita Thapa", property: "Lakeside Villa", checkIn: "Dec 25, 2024", roomType: "Suite" },
  { guestName: "Hari Gurung", property: "Himalayan View Resort", checkIn: "Dec 26, 2024", roomType: "Standard" },
];

const HostDashboard = () => {
  const { profile } = useAuth();

  return (
    <DashboardLayout role="host">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Host Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your properties and track performance
            </p>
          </div>
          <Link to="/host/properties/new">
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Properties"
            value={2}
            icon={Building2}
            iconColor="text-primary"
          />
          <StatCard
            title="Active Bookings"
            value={8}
            change="+12% from last month"
            changeType="positive"
            icon={Calendar}
            iconColor="text-success"
          />
          <StatCard
            title="Upcoming Check-ins"
            value={3}
            icon={Users}
            iconColor="text-accent"
          />
          <StatCard
            title="Avg Occupancy"
            value="67%"
            change="+5% from last month"
            changeType="positive"
            icon={TrendingUp}
            iconColor="text-warning"
          />
        </div>

        {/* Properties Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Your Properties</h2>
            <Link to="/host/properties">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockProperties.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-medium transition-shadow"
              >
                <div className="flex">
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{property.name}</h3>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === "active" 
                          ? "bg-success/10 text-success" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {property.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
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
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Check-ins */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Check-ins</h2>
            <Link to="/host/bookings">
              <Button variant="ghost" size="sm">
                View All Bookings
              </Button>
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Guest</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Property</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Room Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Check-in</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {upcomingCheckIns.map((checkIn, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-card-foreground">{checkIn.guestName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{checkIn.property}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{checkIn.roomType}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{checkIn.checkIn}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost">
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostDashboard;

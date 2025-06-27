import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Archive,
  MessageSquare,
  Heart,
  User,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  InvestorStartupConnectionService,
  ConnectionFilters,
} from "@/lib/investor-startup-connection-service";
import { InvestorStartupConnection } from "@/lib/supabase";

const ConnectionsManagement = () => {
  const [connections, setConnections] = useState<InvestorStartupConnection[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  useEffect(() => {
    fetchConnections();
  }, [typeFilter, statusFilter]);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);

      const filters: ConnectionFilters = {
        status:
          statusFilter === "all"
            ? undefined
            : (statusFilter as "active" | "archived"),
        connection_type:
          typeFilter === "all"
            ? undefined
            : (typeFilter as "interested" | "info_request"),
      };

      const { data, error } =
        await InvestorStartupConnectionService.getConnections(filters);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      setConnections(data);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveConnection = async (connectionId: string) => {
    try {
      const { success, error } =
        await InvestorStartupConnectionService.archiveConnection(connectionId);

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }

      if (success) {
        toast({
          title: "Connection Archived",
          description: "The connection has been archived successfully",
        });
        fetchConnections(); // Refresh the list
      }
    } catch (error) {
      console.error("Error archiving connection:", error);
      toast({
        title: "Error",
        description: "Failed to archive connection",
        variant: "destructive",
      });
    }
  };

  const filteredConnections = connections.filter((connection) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      connection.investor_name.toLowerCase().includes(searchLower) ||
      connection.startup_name.toLowerCase().includes(searchLower) ||
      connection.investor_email.toLowerCase().includes(searchLower) ||
      connection.startup_email.toLowerCase().includes(searchLower)
    );
  });

  const getConnectionTypeIcon = (type: string) => {
    return type === "interested" ? (
      <Heart className="h-4 w-4" />
    ) : (
      <MessageSquare className="h-4 w-4" />
    );
  };

  const getConnectionTypeBadge = (type: string) => {
    return type === "interested" ? (
      <Badge variant="default" className="gap-1">
        <Heart className="h-3 w-3" />
        Interest
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <MessageSquare className="h-3 w-3" />
        Info Request
      </Badge>
    );
  };

  const renderSkeletons = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );

  const stats = {
    total: connections.length,
    interested: connections.filter((c) => c.connection_type === "interested")
      .length,
    infoRequests: connections.filter(
      (c) => c.connection_type === "info_request"
    ).length,
    active: connections.filter((c) => c.status === "active").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Investor-Startup Connections</h2>
        <p className="text-muted-foreground">
          Monitor and manage all investor interactions with startups
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Connections
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interest Shown</p>
                <p className="text-2xl font-bold">{stats.interested}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Info Requests</p>
                <p className="text-2xl font-bold">{stats.infoRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Connections
                </p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by investor name, startup name, or email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Connection Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="interested">Interest Shown</SelectItem>
            <SelectItem value="info_request">Info Requests</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Connections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Connections ({filteredConnections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            renderSkeletons()
          ) : filteredConnections.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No connections found</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== "all" || statusFilter !== "active"
                  ? "Try adjusting your search criteria or filters."
                  : "No connections have been made yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Startup</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConnections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell>
                        {getConnectionTypeBadge(connection.connection_type)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {connection.investor_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {connection.investor_email}
                          </p>
                          {connection.investor_calendly_link && (
                            <a
                              href={connection.investor_calendly_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              Calendly Link
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {connection.startup_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {connection.startup_email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(connection.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {connection.message ? (
                          <div className="max-w-xs">
                            <p
                              className="text-sm truncate"
                              title={connection.message}
                            >
                              {connection.message}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No message
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {connection.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleArchiveConnection(connection.id)
                            }
                            className="gap-1"
                          >
                            <Archive className="h-3 w-3" />
                            Archive
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionsManagement;

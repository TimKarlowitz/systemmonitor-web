'use client';
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Server,
  Search,
  RefreshCw,
  Settings2
} from "lucide-react";

export function ServicesDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServices = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('https://systems.karlowitz.com/monitor/services/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setServices(data.services);
      setError(null);
    } catch (err) {
      setError(`Failed to load services: ${err.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkService = async (serviceId) => {
    try {
      const updatedServices = services.map(s => 
        s.id === serviceId ? { ...s, status: 'checking' } : s
      );
      setServices(updatedServices);

      const response = await fetch(`https://systems.karlowitz.com/monitor/services/${serviceId}/check/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to check service');
      }
      
      await fetchServices();
    } catch (err) {
      setError(`Error checking service: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (service) => {
    if (service.status === 'checking') {
      return <RefreshCw className="text-blue-500 animate-spin" />;
    }
    
    if (!service.latest_check) {
      return <Clock className="text-gray-500" />;
    }

    if (!service.latest_check.is_up) {
      return <AlertCircle className="text-red-500" />;
    }

    if (service.latest_check.response_time > 2000) {
      return <AlertCircle className="text-yellow-500" />;
    }

    return <CheckCircle2 className="text-green-500" />;
  };

  const getStatusClass = (service) => {
    if (service.status === 'checking') return 'border-blue-500';
    if (!service.latest_check) return 'border-gray-300';
    if (!service.latest_check.is_up) return 'border-red-500';
    if (service.latest_check.response_time > 2000) return 'border-yellow-500';
    return 'border-green-500';
  };

  const getResponseTimeClass = (responseTime) => {
    if (!responseTime) return 'text-gray-500';
    if (responseTime > 2000) return 'text-red-500';
    if (responseTime > 1000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const filteredServices = services
    .filter(service => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.url.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(service => {
      if (statusFilter === "all") return true;
      if (!service.latest_check) return statusFilter === "unknown";
      if (!service.latest_check.is_up) return statusFilter === "down";
      if (service.latest_check.response_time > 2000) return statusFilter === "warning";
      return statusFilter === "healthy";
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "status":
          return (a.latest_check?.is_up === b.latest_check?.is_up) ? 
            ((b.latest_check?.response_time || 0) - (a.latest_check?.response_time || 0)) :
            (a.latest_check?.is_up ? -1 : 1);
        case "response":
          return (a.latest_check?.response_time || 0) - (b.latest_check?.response_time || 0);
        case "lastCheck":
          return new Date(b.last_check || 0) - new Date(a.last_check || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const healthyServices = services.filter(s => s.latest_check?.is_up && s.latest_check.response_time <= 2000).length;
  const warningServices = services.filter(s => s.latest_check?.is_up && s.latest_check.response_time > 2000).length;
  const downServices = services.filter(s => !s.latest_check?.is_up).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Systems Monitor</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitoring {services.length} services
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchServices}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Add Service
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Total Services</div>
              <Globe className="text-blue-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Healthy</div>
              <CheckCircle2 className="text-green-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{healthyServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Warning</div>
              <AlertCircle className="text-yellow-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{warningServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">Down</div>
              <AlertCircle className="text-red-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{downServices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            className="pl-10"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="down">Down</option>
            <option value="unknown">Unknown</option>
          </select>
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
            <option value="response">Sort by Response Time</option>
            <option value="lastCheck">Sort by Last Check</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => (
          <Card 
            key={service.id} 
            className={`hover:shadow-lg transition-all ${getStatusClass(service)}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                {service.type === 'API' ? <Server className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                {service.name}
              </CardTitle>
              {getStatusIcon(service)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe size={16} />
                  <a 
                    href={service.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {service.url}
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-sm">
                    <div className="text-gray-500">Response Time</div>
                    <div className={`font-medium ${getResponseTimeClass(service.latest_check?.response_time)}`}>
                      {service.latest_check?.response_time 
                        ? `${Math.round(service.latest_check.response_time)}ms` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Status Code</div>
                    <div className={`font-medium ${
                      !service.latest_check?.status_code ? 'text-gray-500' :
                      service.latest_check.status_code >= 400 ? 'text-red-500' :
                      service.latest_check.status_code >= 300 ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {service.latest_check?.status_code || 'N/A'}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Last Check</div>
                    <div>
                      {service.last_check 
                        ? new Date(service.last_check).toLocaleTimeString() 
                        : 'Never'}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => checkService(service.id)}
                    disabled={service.status === 'checking'}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${service.status === 'checking' ? 'animate-spin' : ''}`} />
                    Check Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No services found matching your filters
        </div>
      )}
    </main>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2, AlertCircle, Clock, Globe, Server } from "lucide-react";

export function ServicesDashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    try {
      console.log('Fetching services...');  // Debug log
      const response = await fetch('https://systems.karlowitz.com/monitor/services/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);  // Debug log
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);  // Debug log
        throw new Error(`Server error: ${response.status}\n${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);  // Debug log
      setServices(data.services);
      setError(null);
    } catch (err) {
      console.error('Full error:', err);  // Debug log
      setError(`Failed to load services: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger a manual check for a service
  const checkService = async (serviceId) => {
    try {
      const response = await fetch(`https://systems.karlowitz.com/monitor/services/${serviceId}/check/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to check service');
      }
      
      // Refresh services list to get updated status
      await fetchServices();
    } catch (err) {
      console.error('Error checking service:', err);
    }
  };

  // Get CSRF token from cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="text-green-500" />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" />;
      case 'down':
        return <AlertCircle className="text-red-500" />;
      default:
        return <Clock className="text-gray-500" />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'API' ? <Server className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const issueServices = services.filter(s => s.status !== 'healthy').length;

  return (
    <main className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Systems Monitor</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor your services and endpoints</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Service
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="text-sm text-gray-500">Issues</div>
              <AlertCircle className="text-yellow-500" />
            </div>
            <div className="text-2xl font-bold mt-2">{issueServices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => checkService(service.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                {getTypeIcon(service.type || 'Website')}
                {service.name}
              </CardTitle>
              {getStatusIcon(service.status)}
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
                    <div className="text-gray-500">Response</div>
                    <div>
                      {service.latest_check?.response_time 
                        ? `${Math.round(service.latest_check.response_time)}ms` 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-500">Status</div>
                    <div>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
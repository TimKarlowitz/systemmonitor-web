import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Server,
} from "lucide-react";

export default function Home() {
  const [services] = useState([
    {
      id: 1,
      name: "Talesy Backend",
      url: "https://talesy.karlowitz.com",
      type: "API",
      status: "healthy",
      lastChecked: "2 min ago",
      responseTime: "238ms",
      uptime: "99.9%",
    },
    {
      id: 2,
      name: "Talesy Website",
      url: "https://talesyapp.com",
      type: "Website",
      status: "warning",
      lastChecked: "1 min ago",
      responseTime: "890ms",
      uptime: "98.5%",
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="text-green-500" />;
      case "warning":
        return <AlertCircle className="text-yellow-500" />;
      case "down":
        return <AlertCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type) => {
    return type === "API" ? (
      <Server className="w-4 h-4" />
    ) : (
      <Globe className="w-4 h-4" />
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <main className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Systems Monitor</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor your services and endpoints
            </p>
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
              <div className="text-2xl font-bold mt-2">
                {services.filter((s) => s.status === "healthy").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">Issues</div>
                <AlertCircle className="text-yellow-500" />
              </div>
              <div className="text-2xl font-bold mt-2">
                {services.filter((s) => s.status !== "healthy").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  {getTypeIcon(service.type)}
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
                    >
                      {service.url}
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-sm">
                      <div className="text-gray-500">Response</div>
                      <div>{service.responseTime}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Uptime</div>
                      <div>{service.uptime}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Last Check</div>
                      <div>{service.lastChecked}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

// app/page.js
import { ServicesDashboard } from "./components/ServicesDashboard";

export default function Home() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <ServicesDashboard />
    </div>
  );
}

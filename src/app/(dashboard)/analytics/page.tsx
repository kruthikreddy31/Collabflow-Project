import { PageHeader } from "@/components/layout/page-header";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" description="Track throughput and trends across your workspaces." />
      <div className="p-8">
        <AnalyticsCharts />
      </div>
    </div>
  );
}

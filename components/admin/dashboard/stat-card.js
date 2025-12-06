import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatCard({ title, value, change, Icon, trend = "neutral" }) {
  const trendColor = {
    up: "text-green-600",
    down: "text-red-600",
    warning: "text-orange-600",
    neutral: "text-muted-foreground",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <p className={`text-xs mt-1 ${trendColor[trend]}`}>{change}</p>
      </CardContent>
    </Card>
  );
}

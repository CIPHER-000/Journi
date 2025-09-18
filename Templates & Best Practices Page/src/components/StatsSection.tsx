import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, FileText, Star } from "lucide-react";

const usageData = [
  { name: "E-commerce", usage: 85 },
  { name: "SaaS", usage: 72 },
  { name: "Healthcare", usage: 68 },
  { name: "FinTech", usage: 54 },
  { name: "Education", usage: 41 }
];

const stats = [
  {
    title: "Total Templates",
    value: "24",
    icon: FileText,
    trend: "+12%"
  },
  {
    title: "Active Users", 
    value: "2,847",
    icon: Users,
    trend: "+23%"
  },
  {
    title: "Avg. Rating",
    value: "4.8",
    icon: Star,
    trend: "+0.2"
  }
];

export function StatsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4">Usage Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-medium">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Usage by Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Bar 
                    dataKey="usage" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Multi-channel tracking", percentage: 92 },
              { name: "Real-time analytics", percentage: 87 },
              { name: "Customer segmentation", percentage: 83 },
              { name: "A/B testing", percentage: 76 },
              { name: "Integration APIs", percentage: 71 }
            ].map((feature, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{feature.name}</span>
                  <span className="text-muted-foreground">{feature.percentage}%</span>
                </div>
                <Progress value={feature.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
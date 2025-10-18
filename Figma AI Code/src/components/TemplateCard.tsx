import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Star, Users, BarChart3 } from "lucide-react";

interface TemplateCardProps {
  id: string;
  name: string;
  industry: string;
  popularity: number;
  rating: number;
  complexity: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  stages: number;
  features: string[];
  onClick: () => void;
}

export function TemplateCard({
  name,
  industry,
  popularity,
  rating,
  complexity,
  description,
  stages,
  features,
  onClick
}: TemplateCardProps) {
  const complexityColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-blue-100 text-blue-800 border-blue-200", 
    Advanced: "bg-purple-100 text-purple-800 border-purple-200"
  };

  const industryColors = {
    "E-commerce": "bg-orange-50 border-orange-200",
    "SaaS": "bg-blue-50 border-blue-200",
    "Healthcare": "bg-green-50 border-green-200",
    "FinTech": "bg-purple-50 border-purple-200",
    "Education": "bg-indigo-50 border-indigo-200"
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 ${industryColors[industry as keyof typeof industryColors] || 'bg-gray-50 border-gray-200'}`}
      onClick={onClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{name}</CardTitle>
          <Badge variant="outline" className={complexityColors[complexity]}>
            {complexity}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{popularity}+ uses</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>{stages} stages</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-1">
          {features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {features.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{features.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
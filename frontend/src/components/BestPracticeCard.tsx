import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { BookOpen, TrendingUp, Clock } from "lucide-react";

interface BestPracticeCardProps {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  impact: "Low" | "Medium" | "High";
  readTime: number;
  description: string;
  tags: string[];
  onClick: () => void;
}

export function BestPracticeCard({
  title,
  category,
  difficulty,
  impact,
  readTime,
  description,
  tags,
  onClick
}: BestPracticeCardProps) {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Advanced: "bg-red-100 text-red-800 border-red-200"
  };

  const impactProgress = {
    Low: 30,
    Medium: 65,
    High: 90
  };

  const impactColors = {
    Low: "bg-gray-200",
    Medium: "bg-blue-200", 
    High: "bg-green-200"
  };

  const categoryColors = {
    Research: "bg-blue-50 border-blue-200",
    "Touchpoint Mapping": "bg-purple-50 border-purple-200",
    Metrics: "bg-green-50 border-green-200",
    Personalization: "bg-orange-50 border-orange-200",
    Collaboration: "bg-indigo-50 border-indigo-200"
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-50 border-gray-200'}`}
      onClick={onClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{title}</CardTitle>
          <Badge variant="outline" className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Impact</span>
            <span className="font-medium">{impact}</span>
          </div>
          <Progress 
            value={impactProgress[impact]} 
            className={`h-2 ${impactColors[impact]}`}
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{category}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Calendar, Users, Map, MoreVertical, Eye, Edit, Download, Trash2 } from "lucide-react";

interface JourneyCardProps {
  journey: {
    id: string;
    title: string;
    status: "draft" | "completed" | "in-progress";
    personas: string[];
    phases: string[];
    dateCreated: string;
    lastModified: string;
  };
  onView?: (journeyId: string) => void;
  onEdit?: (journeyId: string) => void;
  onExport?: (journeyId: string) => void;
  onDelete?: (journeyId: string) => void;
}

export function JourneyCard({ journey, onView, onEdit, onExport, onDelete }: JourneyCardProps) {
  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    "in-progress": "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800"
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium line-clamp-1">{journey.title}</h3>
            <Badge variant="secondary" className={statusColors[journey.status]}>
              {journey.status.replace("-", " ")}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(journey.id)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(journey.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.(journey.id)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(journey.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Personas */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="line-clamp-1">{journey.personas.join(", ")}</span>
        </div>

        {/* Phases */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Map className="h-4 w-4" />
          <span className="line-clamp-1">{journey.phases.length} phases</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created {journey.dateCreated}</span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView?.(journey.id)}
            className="flex-1"
          >
            View
          </Button>
          <Button
            size="sm"
            onClick={() => onEdit?.(journey.id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
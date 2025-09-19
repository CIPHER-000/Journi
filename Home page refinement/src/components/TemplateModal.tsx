import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, Users, BarChart3, CheckCircle, ArrowRight } from "lucide-react";

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    industry: string;
    popularity: number;
    rating: number;
    complexity: "Beginner" | "Intermediate" | "Advanced";
    description: string;
    stages: string[];
    features: string[];
    useCases: string[];
    benefits: string[];
  } | null;
}

export function TemplateModal({ open, onOpenChange, template }: TemplateModalProps) {
  if (!template) return null;

  const complexityColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-blue-100 text-blue-800 border-blue-200",
    Advanced: "bg-purple-100 text-purple-800 border-purple-200"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-2xl">{template.name}</DialogTitle>
            <Badge variant="outline" className={complexityColors[template.complexity]}>
              {template.complexity}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{template.rating.toFixed(1)} rating</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{template.popularity}+ teams using</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>{template.stages.length} stages</span>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="mb-3">Overview</h3>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
          
          <div>
            <h3 className="mb-3">Journey Stages</h3>
            <div className="grid gap-3">
              {template.stages.map((stage, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm">
                    {index + 1}
                  </div>
                  <span>{stage}</span>
                  {index < template.stages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="mb-3">Key Features</h3>
              <div className="space-y-2">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="mb-3">Use Cases</h3>
              <div className="space-y-2">
                {template.useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-3">Expected Benefits</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {template.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="justify-start p-2">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button className="flex-1">Use This Template</Button>
            <Button variant="outline">Preview Demo</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
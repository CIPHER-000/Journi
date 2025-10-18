import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface FilterSectionProps {
  selectedIndustry: string;
  selectedComplexity: string;
  onIndustryChange: (value: string) => void;
  onComplexityChange: (value: string) => void;
  onClearFilters: () => void;
}

export function FilterSection({
  selectedIndustry,
  selectedComplexity,
  onIndustryChange,
  onComplexityChange,
  onClearFilters
}: FilterSectionProps) {
  const hasActiveFilters = selectedIndustry !== "all" || selectedComplexity !== "all";

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-3">
          <Select value={selectedIndustry} onValueChange={onIndustryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Industries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="E-commerce">E-commerce</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="FinTech">FinTech</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedComplexity} onValueChange={onComplexityChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {selectedIndustry !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedIndustry}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onIndustryChange("all")}
                  />
                </Badge>
              )}
              {selectedComplexity !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedComplexity}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onComplexityChange("all")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
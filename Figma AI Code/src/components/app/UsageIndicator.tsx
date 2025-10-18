import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Crown, Plus } from "lucide-react";

interface UsageIndicatorProps {
  plan: "free" | "pro" | "enterprise";
  used: number;
  total: number;
  resetDate?: string;
  onUpgrade?: () => void;
  onTopUp?: () => void;
  className?: string;
}

export function UsageIndicator({ 
  plan, 
  used, 
  total, 
  resetDate, 
  onUpgrade, 
  onTopUp,
  className = ""
}: UsageIndicatorProps) {
  const percentage = (used / total) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= total;

  return (
    <div className={`p-4 border rounded-lg bg-card ${className}`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Journey Usage</h3>
            <Badge variant={plan === "pro" ? "default" : "secondary"} className={plan === "pro" ? "bg-green-600" : ""}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </Badge>
          </div>
          {isNearLimit && (
            <Badge variant="destructive" className="text-xs">
              {isAtLimit ? "Limit Reached" : "Near Limit"}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={percentage} 
            className="h-2"
            indicatorClassName={isNearLimit ? "bg-destructive" : "bg-green-600"}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{used} of {total} used</span>
            {resetDate && plan === "pro" && (
              <span>Resets {resetDate}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {plan === "free" && (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={onUpgrade}
            >
              <Crown className="h-3 w-3" />
              Upgrade to Pro
            </Button>
          )}
          {plan === "pro" && isNearLimit && (
            <Button 
              size="sm" 
              variant="outline"
              className="gap-2"
              onClick={onTopUp}
            >
              <Plus className="h-3 w-3" />
              Buy More Journeys
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
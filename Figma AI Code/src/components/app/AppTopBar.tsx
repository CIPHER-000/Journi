import { Search, Bell, Menu } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { JourniIcon } from "../logos/JourniIcon";

export function AppTopBar() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4 lg:hidden">
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <JourniIcon size="sm" />
            <span className="font-semibold text-gray-900">Journi</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search journeys, templates, reports..." 
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-green-600 text-xs flex items-center justify-center">
              2
            </Badge>
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-medium text-sm">JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
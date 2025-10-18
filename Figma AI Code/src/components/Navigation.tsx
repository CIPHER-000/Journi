import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { JourniCombinationMark } from "./logos/JourniCombinationMark";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "how-it-works", label: "How It Works" },
    { id: "pricing", label: "Pricing" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <JourniCombinationMark size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`transition-colors hover:text-foreground ${
                  activeSection === item.id 
                    ? "text-foreground" 
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">Log In</Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left transition-colors hover:text-foreground ${
                    activeSection === item.id 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" className="justify-start">Log In</Button>
                <Button className="justify-start bg-green-600 hover:bg-green-700">
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
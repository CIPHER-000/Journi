import { useState } from "react";
import { AppLayout } from "./components/app/AppLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { Journeys } from "./components/pages/Journeys";
import { CreateJourney } from "./components/pages/CreateJourney";
import { Templates } from "./components/pages/Templates";
import { Reports } from "./components/pages/Reports";
import { Settings } from "./components/pages/Settings";
import { Account } from "./components/pages/Account";

// Import the original homepage components for reference
import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { PricingSection } from "./components/PricingSection";
import { Footer } from "./components/Footer";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "app">("landing"); // Start in landing for production
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [activeSection, setActiveSection] = useState("home");

  // Handle navigation between landing page sections
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
  };

  // Handle entering the app (simulating login/signup)
  const handleEnterApp = () => {
    setCurrentView("app");
    setCurrentPage("dashboard");
  };

  const handleUpgrade = () => {
    // In a real app, this would open a payment modal or redirect to billing
    console.log("Opening upgrade modal...");
  };

  const handleCreateJourney = () => {
    setCurrentPage("create-journey");
  };

  const handleCreateJourneySubmit = (data: any) => {
    console.log("Creating journey with data:", data);
    // In a real app, this would submit to the backend
    setCurrentPage("journeys"); // Redirect to journeys page after creation
  };

  const handleUseTemplate = (templateId: string) => {
    // In a real app, this would use the template to create a new journey
    console.log("Using template:", templateId);
  };

  // Render the landing page
  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation activeSection={activeSection} onSectionChange={scrollToSection} />
        
        {/* Home Section */}
        <section id="home">
          <HeroSection />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works">
          <HowItWorksSection />
        </section>

        {/* Pricing Section */}
        <section id="pricing">
          <PricingSection />
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-green-50 dark:bg-green-950/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Transform Your Customer Journey Mapping?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join hundreds of SaaS teams who are already using Journi to create better customer experiences.
                  Start your free trial today and see the difference AI-powered journey mapping can make.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={handleEnterApp}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                >
                  Start Your Free Trial
                </button>
                <button className="px-8 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-border rounded-lg font-medium transition-all duration-300 text-lg">
                  Schedule a Demo
                </button>
              </div>

              <div className="pt-8 text-sm text-muted-foreground">
                <p>No credit card required • 14-day free trial • Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Render the app interface
  return (
    <AppLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {currentPage === "dashboard" && (
        <Dashboard 
          onCreateJourney={handleCreateJourney}
          onUpgrade={handleUpgrade}
        />
      )}
      {currentPage === "journeys" && (
        <Journeys 
          onCreateJourney={handleCreateJourney}
          onUpgrade={handleUpgrade}
        />
      )}
      {currentPage === "create-journey" && (
        <CreateJourney 
          onBack={() => setCurrentPage("dashboard")}
          onCreateJourney={handleCreateJourneySubmit}
        />
      )}
      {currentPage === "templates" && (
        <Templates onUseTemplate={handleUseTemplate} />
      )}
      {currentPage === "reports" && <Reports />}
      {currentPage === "settings" && (
        <Settings onUpgrade={handleUpgrade} />
      )}
      {currentPage === "account" && (
        <Account onUpgrade={handleUpgrade} />
      )}
    </AppLayout>
  );
}
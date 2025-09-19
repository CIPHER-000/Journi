import { Button } from "./ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1754299520114-a04483392973?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMGpvdXJuZXklMjBtYXBwaW5nJTIwYW5hbHl0aWNzJTIwZGFzaGJvYXJkfGVufDF8fHx8MTc1ODI3NTExNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      />
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-green-900/85 dark:bg-green-950/90" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 rounded-full border shadow-lg backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">AI-Powered Journey Mapping</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg leading-tight">
              Map Customer Journeys
              <br />
              <span className="text-green-300">
                in Minutes, Not Weeks
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Journi uses AI-powered multi-agent orchestration to rapidly generate professional-grade customer journey maps. 
              Transform your customer research into actionable insights with our 8-step collaborative workflow.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Mapping Your Customer Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900 border-2 border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-12">
            <p className="text-sm text-gray-200 mb-6">Trusted by innovative SaaS teams</p>
            <div className="flex items-center justify-center gap-8 opacity-70">
              {["TechCorp", "InnovateSaaS", "DataFlow", "CustomerFirst", "GrowthLab"].map((company, index) => (
                <div key={index} className="text-lg font-semibold text-gray-200">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
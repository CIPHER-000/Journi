import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { JourneyVisualization } from '../components/JourneyVisualization';
import { PersonaCards } from '../components/PersonaCards';
import { InsightsPanel } from '../components/InsightsPanel';
import { ExportOptions } from '../components/ExportOptions';
import { useJourney } from '../context/JourneyContext';

export function JourneyViewPage() {
  const { id } = useParams<{ id: string }>();
  const { getJourney } = useJourney();
  
  if (!id) {
    return <Navigate to="/dashboard" replace />;
  }

  const journey = getJourney(id);
  
  if (!journey) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {journey.title}
              </h1>
              <div className="flex items-center space-x-4 text-slate-600">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {journey.industry}
                </span>
                <span className="text-sm">
                  Created {journey.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <ExportOptions journey={journey} />
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Personas */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Customer Personas</h2>
              <PersonaCards personas={journey.personas} />
            </section>

            {/* Journey Visualization */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Customer Journey Map</h2>
              <JourneyVisualization phases={journey.journeyPhases} />
            </section>

            {/* Insights */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Insights & Recommendations</h2>
              <InsightsPanel insights={journey.insights} />
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Smile, 
  Frown, 
  AlertTriangle, 
  Lightbulb,
  MessageSquare,
  TouchpadIcon as Touchpoint
} from 'lucide-react';
import { JourneyPhase } from '../types';

interface JourneyVisualizationProps {
  phases: JourneyPhase[];
}

export function JourneyVisualization({ phases }: JourneyVisualizationProps) {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Phase Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Journey Overview</h3>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Positive Emotions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Negative Emotions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-4">
          {phases.map((phase, index) => (
            <React.Fragment key={phase.id}>
              <motion.button
                onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all duration-200 min-w-[200px] ${
                  selectedPhase === phase.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-left">
                  <h4 className="font-semibold text-slate-900 mb-1">{phase.name}</h4>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{phase.description}</p>
                  
                  {/* Emotion indicators */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Smile className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-slate-600">{phase.emotions.positive.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Frown className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-slate-600">{phase.emotions.negative.length}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
              
              {index < phases.length - 1 && (
                <ChevronRight className="w-6 h-6 text-slate-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Detailed Phase View */}
      {selectedPhase && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {(() => {
            const phase = phases.find(p => p.id === selectedPhase);
            if (!phase) return null;

            return (
              <div>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-slate-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{phase.name}</h3>
                  <p className="text-slate-700">{phase.description}</p>
                </div>

                {/* Content Grid */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  {/* Touchpoints */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Touchpoint className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-slate-900">Touchpoints</h4>
                    </div>
                    <div className="space-y-2">
                      {phase.touchpoints.map((touchpoint, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-slate-700 text-sm">{touchpoint}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emotions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Smile className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-slate-900">Emotions</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-2">Positive</h5>
                        <div className="flex flex-wrap gap-2">
                          {phase.emotions.positive.map((emotion, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-2">Negative</h5>
                        <div className="flex flex-wrap gap-2">
                          {phase.emotions.negative.map((emotion, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md">
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-slate-900">Pain Points</h4>
                    </div>
                    <div className="space-y-2">
                      {phase.painPoints.map((pain, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-slate-700 text-sm">{pain}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-slate-900">Opportunities</h4>
                    </div>
                    <div className="space-y-2">
                      {phase.opportunities.map((opportunity, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-slate-700 text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Customer Quotes */}
                {phase.quotes.length > 0 && (
                  <div className="border-t border-slate-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-slate-900">Customer Quotes</h4>
                    </div>
                    <div className="space-y-3">
                      {phase.quotes.map((quote, idx) => (
                        <div key={idx} className="bg-slate-50 rounded-lg p-4">
                          <p className="text-slate-700 italic">"{quote}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
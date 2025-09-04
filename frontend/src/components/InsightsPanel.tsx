import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Lightbulb, Target } from 'lucide-react';
import { Insights } from '../types';

interface InsightsPanelProps {
  insights: Insights;
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Key Findings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-semibold text-slate-900">Key Findings</h3>
        </div>
        
        <div className="space-y-4">
          {insights.keyFindings.map((finding, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-700 text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{finding}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Target className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">Recommendations</h3>
        </div>
        
        <div className="space-y-4">
          {insights.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 text-sm font-bold">{index + 1}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{recommendation}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Emotional Journey Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:col-span-2"
      >
        <h3 className="text-xl font-semibold text-slate-900 mb-6">Emotional Journey Highlights</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Highest Point</h4>
              <p className="text-slate-700">{insights.emotionalJourney.highest}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Lowest Point</h4>
              <p className="text-slate-700">{insights.emotionalJourney.lowest}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { User, Target, AlertTriangle, Heart, Quote } from 'lucide-react';
import { Persona } from '../types';

interface PersonaCardsProps {
  personas: Persona[];
}

export function PersonaCards({ personas }: PersonaCardsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {personas.map((persona, index) => (
        <motion.div
          key={persona.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{persona.name}</h3>
                <p className="text-slate-600 font-medium">{persona.role}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                  <span>{persona.demographics.age}</span>
                  <span>•</span>
                  <span>{persona.demographics.location}</span>
                  <span>•</span>
                  <span>{persona.demographics.income}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Quote */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Quote className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                <p className="text-slate-700 italic leading-relaxed">
                  "{persona.quote}"
                </p>
              </div>
            </div>

            {/* Goals */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-slate-900">Goals</h4>
              </div>
              <ul className="space-y-2">
                {persona.goals.map((goal, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pain Points */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-slate-900">Pain Points</h4>
              </div>
              <ul className="space-y-2">
                {persona.painPoints.map((pain, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">{pain}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Motivations */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-slate-900">Motivations</h4>
              </div>
              <ul className="space-y-2">
                {persona.motivations.map((motivation, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-700 text-sm">{motivation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
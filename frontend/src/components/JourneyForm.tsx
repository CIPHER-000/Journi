import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Zap, AlertCircle } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { useJourney } from '../context/JourneyContext';

interface FormData {
  industry: string;
  businessGoals: string;
  personaTypes: string;
  journeyPhases: string[];
  additionalContext: string;
  files: File[];
}

const JOURNEY_PHASES = [
  'Awareness',
  'Consideration', 
  'Purchase',
  'Onboarding',
  'Usage',
  'Support',
  'Renewal/Retention',
  'Advocacy'
];

const INDUSTRIES = [
  'Technology/SaaS',
  'E-commerce/Retail',
  'Healthcare',
  'Financial Services',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Travel & Hospitality',
  'Media & Entertainment',
  'Other'
];

export function JourneyForm() {
  const { createJourney } = useJourney();
  const [formData, setFormData] = useState<FormData>({
    industry: '',
    businessGoals: '',
    personaTypes: '',
    journeyPhases: [],
    additionalContext: '',
    files: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhaseToggle = (phase: string) => {
    setFormData(prev => ({
      ...prev,
      journeyPhases: prev.journeyPhases.includes(phase)
        ? prev.journeyPhases.filter(p => p !== phase)
        : [...prev.journeyPhases, phase]
    }));
  };

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, files }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.businessGoals) newErrors.businessGoals = 'Business goals are required';
    if (!formData.personaTypes) newErrors.personaTypes = 'Persona types are required';
    if (formData.journeyPhases.length === 0) newErrors.journeyPhases = 'Select at least one journey phase';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Prepare form data with actual File objects for upload
      const submitData = {
        ...formData,
        files: formData.files // Keep File objects for upload
      };
      
      await createJourney(submitData);
    } catch (error) {
      console.error('Failed to create journey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Industry Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.industry ? 'border-red-300' : 'border-slate-300'
            }`}
          >
            <option value="">Select your industry</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.industry}
            </p>
          )}
        </div>

        {/* Business Goals */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Business Goals *
          </label>
          <textarea
            value={formData.businessGoals}
            onChange={(e) => setFormData(prev => ({ ...prev, businessGoals: e.target.value }))}
            placeholder="Describe your key business objectives (e.g., increase conversion rates, reduce churn, improve customer satisfaction...)"
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.businessGoals ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors.businessGoals && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.businessGoals}
            </p>
          )}
        </div>

        {/* Persona Types */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Target Personas *
          </label>
          <textarea
            value={formData.personaTypes}
            onChange={(e) => setFormData(prev => ({ ...prev, personaTypes: e.target.value }))}
            placeholder="Describe your target customer segments (e.g., Small business owners, Enterprise decision makers, Tech-savvy millennials...)"
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.personaTypes ? 'border-red-300' : 'border-slate-300'
            }`}
          />
          {errors.personaTypes && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.personaTypes}
            </p>
          )}
        </div>

        {/* Journey Phases */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Journey Phases to Focus On *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {JOURNEY_PHASES.map(phase => (
              <button
                key={phase}
                type="button"
                onClick={() => handlePhaseToggle(phase)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  formData.journeyPhases.includes(phase)
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
          {errors.journeyPhases && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.journeyPhases}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Research Files (Optional)
          </label>
          <p className="text-sm text-slate-600 mb-4">
            Upload transcripts, surveys, workshop notes, or other research materials. Our AI will extract key insights automatically.
          </p>
          <FileUpload onFilesChange={handleFilesChange} />
        </div>

        {/* Additional Context */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Additional Context (Optional)
          </label>
          <textarea
            value={formData.additionalContext}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
            placeholder="Any specific requirements, constraints, or additional context that would help create a better journey map..."
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Journey Map...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Generate Journey Map</span>
              </>
            )}
          </button>
          
          <p className="text-sm text-slate-500 text-center mt-4">
            This process typically takes 2-5 minutes. You'll be notified when your journey map is ready.
          </p>
        </div>
      </form>
    </motion.div>
  );
}
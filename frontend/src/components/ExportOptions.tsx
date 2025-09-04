import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Image, Presentation, ChevronDown } from 'lucide-react';
import { JourneyMap } from '../types';

interface ExportOptionsProps {
  journey: JourneyMap;
}

export function ExportOptions({ journey }: ExportOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    {
      id: 'pdf',
      label: 'PDF Report',
      description: 'Complete journey map with all details',
      icon: FileText,
      action: () => exportToPDF(journey)
    },
    {
      id: 'image',
      label: 'PNG Image',
      description: 'Visual journey map for presentations',
      icon: Image,
      action: () => exportToImage(journey)
    },
    {
      id: 'slides',
      label: 'PowerPoint Slides',
      description: 'Ready-to-present slide deck',
      icon: Presentation,
      action: () => exportToSlides(journey)
    }
  ];

  const exportToPDF = async (journey: JourneyMap) => {
    // In a real app, this would generate a PDF
    console.log('Exporting to PDF:', journey.title);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${journey.title.replace(/\s+/g, '_')}_journey_map.pdf`;
    link.click();
  };

  const exportToImage = async (journey: JourneyMap) => {
    // In a real app, this would capture the journey visualization as an image
    console.log('Exporting to Image:', journey.title);
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${journey.title.replace(/\s+/g, '_')}_journey_map.png`;
    link.click();
  };

  const exportToSlides = async (journey: JourneyMap) => {
    // In a real app, this would generate PowerPoint slides
    console.log('Exporting to Slides:', journey.title);
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${journey.title.replace(/\s+/g, '_')}_presentation.pptx`;
    link.click();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
      >
        <Download className="w-5 h-5" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
          >
            <div className="p-2">
              {exportOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <option.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{option.label}</h4>
                    <p className="text-sm text-slate-600">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
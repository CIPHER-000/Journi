import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface JourneyReportProps {
  title: string;
  children: React.ReactNode;
  onExport?: (format: 'pdf' | 'png' | 'svg') => void;
  onShare?: () => void;
  className?: string;
}

export function JourneyReport({
  title,
  children,
  onExport,
  onShare,
  className = ''
}: JourneyReportProps) {
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const handleExport = async (format: 'pdf' | 'png' | 'svg') => {
    setIsExporting(true);
    try {
      await onExport?.(format);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-hard border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Interactive customer journey visualization
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-medium text-gray-600">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Export Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </>
                )}
              </motion.button>

              {/* Export Options (appears on hover) */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-hard border border-gray-200 py-2 opacity-0 invisible hover:opacity-100 hover:visible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport('png')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as PNG
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export as SVG
                </button>
              </div>
            </div>

            {/* Share Button */}
            {onShare && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onShare}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="relative">
        {/* Scrollable Container */}
        <div className="overflow-auto max-h-[600px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale }}
            transition={{ duration: 0.3 }}
            className="transform origin-top-left"
            style={{ transform: `scale(${scale})` }}
          >
            <div className="p-6 min-w-full">
              {children}
            </div>
          </motion.div>
        </div>

        {/* Zoom Indicator */}
        {scale !== 1 && (
          <div className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-1 rounded-full text-sm">
            Zoom: {Math.round(scale * 100)}%
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p>
            Interactive • Exportable • Shareable
          </p>
        </div>
      </div>
    </div>
  );
}

// JourneyReportSection component for organizing content
interface JourneyReportSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function JourneyReportSection({
  title,
  description,
  children,
  className = ''
}: JourneyReportSectionProps) {
  return (
    <div className={`mb-8 last:mb-0 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="bg-gray-50 rounded-xl p-6">
        {children}
      </div>
    </div>
  );
}

// JourneyReportCard component for displaying data cards
interface JourneyReportCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  className?: string;
}

export function JourneyReportCard({
  title,
  value,
  change,
  icon,
  className = ''
}: JourneyReportCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? '↑' : '↓'}
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
      <h4 className="text-sm font-medium text-gray-600 mb-1">{title}</h4>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
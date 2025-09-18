import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, Calendar, Users, ChevronRight, CheckCircle, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface JourneyMap {
  id: string;
  title: string;
  industry?: string;
  createdAt: Date | string;
  status: 'completed' | 'processing' | 'failed' | 'queued' | 'running';
  personas?: number;
  phases?: number;
  progress?: number;
}

interface JourneyCardProps {
  journey: JourneyMap;
}

export function JourneyCard({ journey }: JourneyCardProps) {
  const navigate = useNavigate();

  const handleView = () => {
    if (journey.status === 'processing' || journey.status === 'queued' || journey.status === 'running') {
      navigate('/create', {
        state: {
          restoreJourney: true,
          journeyId: journey.id,
          journeyTitle: journey.title
        }
      });
    } else {
      navigate(`/journey/${journey.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
      case 'running':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-soft transition-all duration-300 cursor-pointer"
      onClick={handleView}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {journey.title}
            </h3>
            <p className="text-sm text-gray-600">
              {journey.industry || 'General'}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(journey.status)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(journey.status)}
              <span className="capitalize">{journey.status}</span>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{format(new Date(journey.createdAt), 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Progress Bar for processing journeys */}
      {(journey.status === 'processing' || journey.status === 'running') && journey.progress && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{journey.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${journey.progress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Personas</p>
              <p className="text-sm font-medium text-gray-900">{journey.personas || 2}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Map className="w-4 h-4 text-secondary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Phases</p>
              <p className="text-sm font-medium text-gray-900">{journey.phases || 5}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-gray-600">Click to view</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
}
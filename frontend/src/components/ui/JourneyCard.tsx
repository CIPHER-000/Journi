import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Eye, Download, MoreVertical, Map, Users, Calendar,
  CheckCircle, Clock, AlertCircle, Pause
} from 'lucide-react';

interface JourneyData {
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
  journey: JourneyData;
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
  className?: string;
}

export function JourneyCard({
  journey,
  onView,
  onDownload,
  className = ''
}: JourneyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          label: 'Completed'
        };
      case 'processing':
      case 'running':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          label: 'Processing'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'Failed'
        };
      case 'queued':
        return {
          icon: Pause,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          label: 'Queued'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          label: 'Unknown'
        };
    }
  };

  const statusInfo = getStatusInfo(journey.status);
  const StatusIcon = statusInfo.icon;

  const handleView = () => {
    if (onView) {
      onView(journey.id);
    } else {
      navigate(`/journey/${journey.id}`);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(journey.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-hard transition-all duration-300 cursor-pointer overflow-hidden ${className}`}
      onClick={handleView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      {/* Status Banner */}
      <div className={`absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl ${statusInfo.bgColor} border-l border-b ${statusInfo.borderColor}`}>
        <div className="flex items-center space-x-1.5">
          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Progress Bar (for processing/running status) */}
      {(journey.status === 'processing' || journey.status === 'running') && journey.progress !== undefined && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 to-secondary-600"
            initial={{ width: 0 }}
            animate={{ width: `${journey.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-20">
            {journey.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(journey.createdAt), 'MMM d, yyyy')}</span>
            </span>
            {journey.industry && (
              <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                {journey.industry}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Users className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Personas</p>
              <p className="font-semibold text-gray-900">{journey.personas || 0}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary-50 rounded-lg">
              <Map className="w-4 h-4 text-secondary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Phases</p>
              <p className="font-semibold text-gray-900">{journey.phases || 0}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-hard border border-gray-200 py-2 z-10"
              >
                <Link
                  to={`/journey/${journey.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Journey
                </Link>
                <Link
                  to={`/journey/${journey.id}/duplicate`}
                  onClick={(e) => e.stopPropagation()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Duplicate
                </Link>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle delete
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-primary-600/5 to-secondary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
    </motion.div>
  );
}
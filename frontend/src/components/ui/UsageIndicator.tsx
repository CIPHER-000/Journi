import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Plus, TrendingUp } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface UsageIndicatorProps {
  plan: "free" | "pro" | "enterprise";
  used: number;
  total: number;
  resetDate?: string;
  onUpgrade?: () => void;
  onTopUp?: () => void;
  className?: string;
}

export function UsageIndicator({
  plan,
  used,
  total,
  resetDate,
  onUpgrade,
  onTopUp,
  className = ""
}: UsageIndicatorProps) {
  const percentage = (used / total) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= total;

  return (
    <div className={`bg-white shadow-sm border border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Plan Usage</h3>
              <p className="text-sm text-gray-600">{plan === 'free' ? 'Free' : 'Pro'} Plan</p>
            </div>
          </div>
          {isNearLimit && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              {isAtLimit ? "Limit Reached" : "Near Limit"}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {plan === 'free' ? 'Journeys Used' : 'Journeys This Month'}
            </span>
            <span className="font-medium text-gray-900">
              {used}/{total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${isNearLimit ? 'bg-red-500' : 'bg-gradient-to-r from-green-600 to-green-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          {resetDate && plan === "pro" && (
            <p className="text-xs text-gray-500">Resets {resetDate}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {plan === "free" && (
            <PrimaryButton
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1"
              onClick={onUpgrade}
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade
            </PrimaryButton>
          )}
          {plan === "pro" && isNearLimit && (
            <PrimaryButton
              size="sm"
              variant="secondary"
              className="gap-2 flex-1"
              onClick={onTopUp}
            >
              <Plus className="w-4 h-4" />
              Buy More
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
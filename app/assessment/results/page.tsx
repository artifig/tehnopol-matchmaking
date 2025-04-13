"use client";

import React, { useState, useEffect } from "react";
import Modal from '@/components/utils/modal';
import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { useRouter } from "next/navigation";

interface Provider {
  name: string;
  logo: string;
  shortDescription: string;
  details: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
}

interface MetricResult {
  score: number;
  description: string;
}

interface Metrics {
  [categoryName: string]: MetricResult;
}

export default function ResultsPage() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = React.useState(false);
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const responseId = localStorage.getItem('responseId');

      if (!responseId) {
        setError("Assessment session not found. Please start the assessment again.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/assessment/fetchResults?responseId=${responseId}`);
        const data = await res.json();

        if (data.success) {
          setMetrics(data.metrics);
          setProviders(data.providers);
        } else {
          setError(data.error || "Failed to load results.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("An error occurred while fetching results.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const overallScore = metrics
    ? Math.round(
        Object.values(metrics).reduce((sum, metricResult) => sum + metricResult.score, 0) / Object.values(metrics).length
      )
    : 0;

  const handleDownload = () => {
    const responseId = localStorage.getItem('responseId');
    if (!metrics || !providers || !responseId) {
      console.error("Assessment data or responseId not loaded yet.");
      alert("Please wait for results to load before downloading.");
      return;
    }
    try {
      localStorage.setItem('reportMetrics', JSON.stringify(metrics));
      localStorage.setItem('reportProviders', JSON.stringify(providers));
      localStorage.setItem('reportResponseId', responseId);
      router.push('/contact?action=download');
    } catch (error) {
      console.error("Error storing report data:", error);
      alert("Failed to prepare report data for download.");
    }
  };

  const handleSendEmail = () => {
    const responseId = localStorage.getItem('responseId');
    if (!metrics || !providers || !responseId) {
      console.error("Assessment data or responseId not loaded yet.");
      alert("Please wait for results to load before emailing.");
      return;
    }
     try {
      localStorage.setItem('reportMetrics', JSON.stringify(metrics));
      localStorage.setItem('reportProviders', JSON.stringify(providers));
      localStorage.setItem('reportResponseId', responseId);
      router.push('/contact?action=email');
    } catch (error) {
      console.error("Error storing report data:", error);
      alert("Failed to prepare report data for email.");
    }
  };

  if (isLoading) {
    return (
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="h1 font-red-hat-display mb-4">Loading Results...</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">Please wait while we process your assessment data.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
     return (
      <section className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="pt-32 pb-12 md:pt-40 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="h1 font-red-hat-display mb-4 text-red-500">Error</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Results Header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h1 className="h1 font-red-hat-display mb-4">Assessment Results</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Review your performance, discover insights and find your matched partners for achieving your business goals.
            </p>
          </div>

          {/* Radar Chart Section */}
          <div className="max-w-xl mx-auto w-full mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">Performance Overview</h2>
            <div className="w-full h-64 mb-6">
              {metrics && <RadarChart metrics={metrics} />}
            </div>
            {metrics && <MetricItem title="Overall Score" score={overallScore} description={null} />}
            <button 
              onClick={() => setIsMetricsModalOpen(true)} 
              className="btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full flex items-center justify-center"
            >
              <span>View Detailed Metrics</span>
              <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-current" d="M6.602 11l-.875-.864L9.33 6.534H0v-1.25h9.33L5.727 1.693l.875-.875 5.091 5.091z" />
              </svg>
            </button>
          </div>

          {/* Matched Solution Providers Section */}
          <div className="max-w-xl mx-auto w-full mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
              Matched Solution Providers
            </h2>
            <div className="flex flex-col space-y-4">
              {providers.map((provider, index) => (
                <SolutionCard
                  key={index}
                  name={provider.name}
                  logo={provider.logo}
                  onLearnMore={() => setSelectedProvider(provider)}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-xl mx-auto w-full flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleDownload}
              type="button"
              className="btn text-white bg-orange-500 hover:bg-orange-400 w-full sm:w-auto flex items-center justify-center px-6 py-3"
            >
              <span>Download Report</span>
              <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-current" d="M6 8.825L11.4 3.425L10.675 2.7L6.75 6.625V0H5.25V6.625L1.325 2.7L0.6 3.425L6 8.825ZM0.75 12H11.25V10.5H0.75V12Z" />
              </svg>
            </button>
            <button
              onClick={handleSendEmail}
              type="button"
              className="btn text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-full sm:w-auto flex items-center justify-center px-6 py-3"
            >
              <span>Email Report</span>
              <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-current" d="M10.5 0H1.5C0.675 0 0 0.675 0 1.5V10.5C0 11.325 0.675 12 1.5 12H10.5C11.325 12 12 11.325 12 10.5V1.5C12 0.675 11.325 0 10.5 0ZM10.5 3L6 6.75L1.5 3V1.5L6 5.25L10.5 1.5V3Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedProvider && (
        <Modal isOpen={true} onClose={() => setSelectedProvider(null)}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{selectedProvider.name}</h3>
            <p className="text-gray-600 dark:text-gray-400">{selectedProvider.shortDescription}</p>
            <p className="text-gray-600 dark:text-gray-400">{selectedProvider.details}</p>
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Information</p>
              <div className="flex flex-col space-y-1">
                <p className="text-gray-600 dark:text-gray-400">{selectedProvider.contactName}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedProvider.contactRole}</p>
                <a 
                  href={`mailto:${selectedProvider.contactEmail}`}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500 transition-colors duration-300"
                >
                  {selectedProvider.contactEmail}
                </a>
                <a 
                  href={`tel:${selectedProvider.contactPhone}`}
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500 transition-colors duration-300"
                >
                  {selectedProvider.contactPhone}
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {isMetricsModalOpen && metrics && (
        <Modal isOpen={true} onClose={() => setIsMetricsModalOpen(false)}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Detailed Metrics</h3>
            <div className="space-y-6">
              {Object.entries(metrics).map(([title, metricResult]) => (
                <MetricItem 
                  key={title} 
                  title={title} 
                  score={metricResult.score} 
                  description={metricResult.description}
                />
              ))}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function RadarChart({ metrics }: { metrics: Metrics }) {
  const data = Object.entries(metrics).map(([category, result]) => ({ 
      category, 
      value: result.score
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          <PolarGrid gridType="circle" />
          <PolarAngleAxis dataKey="category" tick={{ fill: 'currentColor', fontSize: 12 }} />
          <Radar
            name="Performance"
            dataKey="value"
            stroke="rgb(249, 115, 22)"
            fill="rgb(249, 115, 22)"
            fillOpacity={0.3}
          />
          <Tooltip
            content={({ active, payload }: { active?: boolean; payload?: Array<any> }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border bg-white dark:bg-gray-800 p-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {payload[0].payload.category}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {payload[0].value}%
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricItem({ title, score, description }: { title: string; score: number; description: string | null }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium mr-1">{title}</span>
          {description && (
            <div className="inline-block cursor-help group relative">
                <svg className="w-4 h-4 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-3H7V4h2v5z"></path>
                </svg>
                <span className="absolute left-0 -top-2 ml-6 w-64 p-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 dark:bg-gray-100 dark:text-gray-800 shadow-lg">
                    {description}
                </span>
            </div>
          )}
        </div>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}

function SolutionCard({ name, logo, onLearnMore }: { name: string; logo: string | null; onLearnMore: () => void; }) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 flex-shrink-0 bg-gray-100 dark:bg-gray-400 rounded-lg p-2 flex items-center justify-center">
          {logo ? (
            <img 
              src={logo} 
              alt={`${name} logo`} 
              className={`w-full h-full object-contain ${logo && logo.includes('AIRE') ? 'dark:invert' : ''}`}
            />
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-300">No Logo</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 truncate pr-2">{name}</h3>
        </div>
        <button
          onClick={onLearnMore}
          type="button"
          className="btn text-white bg-orange-500 hover:bg-orange-400 flex items-center justify-center px-4 py-2 text-sm"
        >
          <span>Learn More</span>
          <svg className="w-3 h-3 shrink-0 mt-px ml-2" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
            <path className="fill-current" d="M6.602 11l-.875-.864L9.33 6.534H0v-1.25h9.33L5.727 1.693l.875-.875 5.091 5.091z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
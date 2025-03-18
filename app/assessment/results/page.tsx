"use client";

import React from "react";
import Modal from '@/components/utils/modal';
import { ResponsiveContainer, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';

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

export default function ResultsPage() {
  const [showMetrics, setShowMetrics] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | null>(null);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = React.useState(false);

  const providers = [
    {
      name: "Science and Business Park Tehnopol",
      logo: "/logo/logo-Tehnopol.png",
      shortDescription: "Expert in Business Strategy and Operations",
      details: "We are a team of experts in business strategy and operations with vast experience in supporting startups and scaleups.",
      contactName: "Rauno Varblas",
      contactRole: "Head of AI and Innovation",
      contactEmail: "rauno.varblas@tehnopol.ee",
      contactPhone: "+372 5123 4567"
    },
    {
      name: "AI & Robotics Estonia",
      logo: "/logo/logo-AIRE.png",
      shortDescription: "Consortia of Estonian AI and Robotics academics",
      details: "We are flexible team of academics and support staff, ready to help you with your AI and robotics projects.",
      contactName: "Evelin Ebruk",
      contactRole: "Head of Client Relations",
      contactEmail: "evelin.ebruk@aire-edih.eu",
      contactPhone: "+372 5987 6543"
    },
    {
      name: "Artifig",
      logo: "/logo/logo-Artifig.png",
      shortDescription: "Technical AI Solutions and Strategy",
      details: "We are a small team of experts in AI with an academic background, and plenty of business experience. We are dedicated to providing the best possible solutions for our clients.",
      contactName: "Otto Mättas",
      contactRole: "AI Solutions Architect",
      contactEmail: "otto@artifig.com",
      contactPhone: "+372 5662 8362"
    }
  ];

  const metrics = {
    "Business Strategy": 76,
    "Operations": 54,
    "Growth & Marketing": 89,
    "Digital Maturity": 65,
    "Innovation Readiness": 72,
    "AI & Data Capabilities": 68,
    "Team & Skills": 81
  };

  const overallScore = Math.round(
    Object.values(metrics).reduce((sum, value) => sum + value, 0) / Object.values(metrics).length
  );

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
              <RadarChart />
            </div>
            <MetricItem title="Overall Score" value={overallScore} />
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

      {isMetricsModalOpen && (
        <Modal isOpen={true} onClose={() => setIsMetricsModalOpen(false)}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Detailed Metrics</h3>
            <div className="space-y-6">
              <MetricItem title="Business Strategy" value={76} />
              <MetricItem title="Operations" value={54} />
              <MetricItem title="Growth & Marketing" value={89} />
              <MetricItem title="Digital Maturity" value={65} />
              <MetricItem title="Innovation Readiness" value={72} />
              <MetricItem title="AI & Data Capabilities" value={68} />
              <MetricItem title="Team & Skills" value={81} />
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function RadarChart() {
  const data = [
    { category: "Business Strategy", value: 76 },
    { category: "Operations", value: 54 },
    { category: "Growth & Marketing", value: 89 },
    { category: "Digital Maturity", value: 65 },
    { category: "Innovation Readiness", value: 72 },
    { category: "AI & Data Capabilities", value: 68 },
    { category: "Team & Skills", value: 81 }
  ];

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

function MetricItem({ title, value }: { title: string; value: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-gray-700 dark:text-gray-300 font-medium">{title}</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

function SolutionCard({ name, logo, onLearnMore }: { name: string; logo: string; onLearnMore: () => void; }) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 flex-shrink-0 bg-gray-100 dark:bg-gray-400 rounded-lg p-2">
          <img 
            src={logo} 
            alt={`${name} logo`} 
            className={`w-full h-full object-contain ${logo.includes('AIRE') ? 'invert' : ''}`}
          />
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

function handleDownload() {
  console.log("Download Report clicked.");
  alert("Report downloaded (mock).");
}

function handleSendEmail() {
  console.log("Send Report via Email clicked.");
  alert("Report sent via email (mock).");
}
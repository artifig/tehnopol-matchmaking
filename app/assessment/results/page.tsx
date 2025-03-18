"use client";

import React from "react";

export default function ResultsPage() {
  return (
    <section className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20 text-center">
          <h1 className="h1 font-red-hat-display mb-4">Assessment Results</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your results based on the assessment. Review your performance and discover insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Radar Chart Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Category Radar Chart</h2>
            <div className="w-full h-64 flex items-center justify-center">
              <RadarChart />
            </div>
          </div>

          {/* Metrics Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Metrics</h2>
            <MetricItem title="Business Strategy" value={76} />
            <MetricItem title="Operations" value={54} />
            <MetricItem title="Growth & Marketing" value={89} />
            <MetricItem title="Overall Score" value={80} />
            {/* Additional metrics can be added here */}
          </div>
        </div>

        {/* Buttons Section */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleDownload}
            type="button"
            className="btn bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600"
          >
            Download Report
          </button>
          <button
            onClick={handleSendEmail}
            type="button"
            className="btn bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400"
          >
            Send Report via Email
          </button>
        </div>

        {/* Recommended Solution Providers Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700 dark:text-gray-300">
            Recommended Solution Providers
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <SolutionCard name="Provider One" description="Expert in Business Strategy" />
            <SolutionCard name="Provider Two" description="Operations Optimization" />
            <SolutionCard name="Provider Three" description="Growth and Marketing Solutions" />
            {/* Add more solution cards as needed */}
          </div>
        </div>

      </div>
    </section>
  );
}

function RadarChart() {
  // This is a mock component. In a real application, integrate a chart library (e.g., Chart.js, Recharts) to display a radar chart.
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
      <span className="text-gray-500 dark:text-gray-300">Radar Chart Placeholder</span>
    </div>
  );
}

function MetricItem({ title, value }: { title: string; value: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-gray-700 dark:text-gray-300">{title}</span>
        <span className="text-gray-700 dark:text-gray-300">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function SolutionCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{name}</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
      <button
        type="button"
        className="btn mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
      >
        Learn More
      </button>
    </div>
  );
}

function handleDownload() {
  // Mock download function
  console.log("Download Report clicked.");
  alert("Report downloaded (mock).");
}

function handleSendEmail() {
  // Mock email function
  console.log("Send Report via Email clicked.");
  alert("Report sent via email (mock).");
} 
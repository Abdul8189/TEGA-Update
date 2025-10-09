import React from "react";

const ResultsPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-3xl text-center space-y-8">
        {/* Headings */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Find Your Results
        </h1>
        <h2 className="text-lg md:text-xl text-gray-600">
          Enter your registered email to check your results instantly.
        </h2>

        {/* Search Box */}
        <div className="relative flex w-full max-w-2xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-grow px-6 py-4 rounded-l-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg shadow-md transition-all duration-300"
          />
          <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-r-2xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300">
            Search
          </button>
        </div>

        {/* Extra Dynamic Styling Effect */}
        <div className="mt-10">
          <p className="text-gray-500 animate-pulse">
             Stay tuned! Results are updated in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

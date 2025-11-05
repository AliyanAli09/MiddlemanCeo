import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Button from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import { INDUSTRIES, CITIES, PROGRAMS } from "@/constants";

/**
 * Blueprint Page (Page 2)
 * Shows Blueprint video and 4-step business selector
 */
const BlueprintPage = () => {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedPaymentOption, setSelectedPaymentOption] = useState("");

  // Check if user came from lead capture
  useEffect(() => {
    const leadId = sessionStorage.getItem("leadId");
    if (!leadId) {
      // Redirect back to landing page if no lead data
      navigate("/");
    }
  }, [navigate]);

  // Auto-select payment option for Basic Plan (only one option)
  useEffect(() => {
    if (selectedProgram) {
      const programData = PROGRAMS.find((p) => p.id === selectedProgram);
      if (programData && programData.paymentOptions.length === 1) {
        setSelectedPaymentOption(programData.paymentOptions[0].type);
      }
    }
  }, [selectedProgram]);

  // Check if all selections are made
  const isFormComplete =
    selectedIndustry &&
    selectedCity &&
    selectedProgram &&
    selectedPaymentOption;

  const handleLaunchBusiness = () => {
    if (!isFormComplete) return;

    // Get full program and payment option details
    const programData = PROGRAMS.find((p) => p.id === selectedProgram);
    const paymentOptionData = programData.paymentOptions.find(
      (o) => o.type === selectedPaymentOption
    );

    // Store selections in sessionStorage
    const orderData = {
      industry: selectedIndustry,
      city: selectedCity,
      program: selectedProgram,
      programName: programData.name,
      paymentOption: selectedPaymentOption,
      paymentOptionData: paymentOptionData,
    };
    sessionStorage.setItem("orderData", JSON.stringify(orderData));

    // Navigate to checkout page
    navigate("/checkout");
  };

  // Get selected program details
  const selectedProgramData = PROGRAMS.find((p) => p.id === selectedProgram);

  return (
    <Layout>
      <div className="py-8 md:py-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Blueprint Video Section */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Watch the{" "}
                <span className="text-blue-600">Middleman Blueprint</span>
              </h1>
              <p className="text-lg text-gray-600">
                Then launch your own Middleman business today
              </p>
            </div>

            {/* Video Player */}
            {/* Video Player */}
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-8">
              <div className="aspect-video rounded-lg overflow-hidden">
                {/* YouTube Video Embed - Replace VIDEO_ID with your actual video ID */}
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/YlWQQW30JlI?rel=0&modestbranding=1"
                  title="Middleman Blueprint Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>

                {/* Alternative: Vimeo Embed - Uncomment if using Vimeo */}
                {/* <iframe
      src="https://player.vimeo.com/video/YOUR_VIMEO_ID"
      width="100%"
      height="100%"
      frameBorder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    ></iframe> */}

                {/* Alternative: Self-hosted video - Uncomment if using self-hosted */}
                {/* <video
      controls
      className="w-full h-full"
      poster="/path-to-thumbnail.jpg"
    >
      <source src="/path-to-video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video> */}
              </div>
            </div>
          </div>

          {/* Drive-Thru Selector Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
              Launch Your Business in 4 Simple Steps
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Select your preferences below to get started
            </p>

            <div className="space-y-6">
              {/* Step 1: Choose Industry */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm mr-3">
                    1
                  </span>
                  Choose Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                >
                  <option value="">Select an industry...</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Choose City */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm mr-3">
                    2
                  </span>
                  Choose City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                >
                  <option value="">Select a city...</option>
                  {CITIES.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Choose Program */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm mr-3">
                    3
                  </span>
                  Choose Program
                </label>

                <div className="grid md:grid-cols-3 gap-4">
                  {PROGRAMS.map((program) => (
                    <div
                      key={program.id}
                      onClick={() => {
                        setSelectedProgram(program.id);
                        setSelectedPaymentOption(""); // Reset payment option when program changes
                      }}
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedProgram === program.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {program.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            POPULAR
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {program.name}
                      </h3>
                      <p className="text-3xl font-bold text-blue-600 mb-2">
                        {program.priceDisplay}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {program.description}
                      </p>

                      <ul className="space-y-2">
                        {program.features.slice(0, 3).map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 flex items-start"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Payment Options (show only when a program with multiple options is selected) */}
                {selectedProgram &&
                  selectedProgramData &&
                  selectedProgramData.paymentOptions.length > 1 && (
                    <div className="mt-6">
                      <label className="block text-base font-semibold text-gray-700 mb-3">
                        Select Payment Option
                      </label>
                      <div className="space-y-3">
                        {selectedProgramData.paymentOptions.map(
                          (option, index) => (
                            <label
                              key={index}
                              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedPaymentOption === option.type
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-300 hover:border-blue-400"
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentOption"
                                value={option.type}
                                checked={selectedPaymentOption === option.type}
                                onChange={(e) =>
                                  setSelectedPaymentOption(e.target.value)
                                }
                                className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-3 flex-1">
                                <span className="block font-semibold text-gray-900">
                                  {option.label}
                                </span>
                                <span className="block text-sm text-gray-600">
                                  {option.display}
                                </span>
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Step 4: Launch Button */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm mr-3">
                    4
                  </span>
                  Ready to Launch?
                </label>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!isFormComplete}
                  onClick={handleLaunchBusiness}
                >
                  LAUNCH MY BUSINESS
                </Button>

                {!isFormComplete && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Please complete all selections above
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlueprintPage;

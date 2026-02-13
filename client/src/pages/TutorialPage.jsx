import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Button from "@/components/common/Button";

/**
 * Tutorial Page
 * Shows 2-hour tutorial videos (Part 1 & Part 2)
 * Only accessible after purchase
 */
const TutorialPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [leadData, setLeadData] = useState(null);
  const [activePart, setActivePart] = useState(1);

  useEffect(() => {
    // Load order and lead data from sessionStorage
    const orderId = sessionStorage.getItem("orderId");
    const storedOrderData = sessionStorage.getItem("orderData");
    const storedLeadData = sessionStorage.getItem("leadData");

    // Only redirect if NO data at all (not just missing orderId)
    // This allows access after successful payment even if orderId isn't set yet
    if (!storedOrderData && !storedLeadData) {
      // No payment data found - redirect to home
      navigate("/");
      return;
    }

    if (storedOrderData) setOrderData(JSON.parse(storedOrderData));
    if (storedLeadData) setLeadData(JSON.parse(storedLeadData));
  }, [navigate]);

  const tutorials = [
    {
      part: 1,
      title: "Part 1: Getting Started",
      videoId: "Jx5AE8HD2CU",
      description:
        "Learn the fundamentals of the Middleman business model and how to set up your business.",
      duration: "~60 minutes",
    },
    {
      part: 2,
      title: "Part 2: Advanced Strategies",
      videoId: "70B0mZOLjWs",
      description:
        "Discover advanced techniques to scale your business and maximize profits.",
      duration: "~60 minutes",
    },
  ];

  return (
    <Layout>
      <div className="py-8 md:py-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Welcome to Your Tutorial,{" "}
              {leadData?.name?.split(" ")[0] || "Student"}! 🎉
            </h1>
            <p className="text-lg text-blue-100">
              You've made a great decision. Let's get you started on building
              your Middleman business!
            </p>
          </div>

          {/* Tutorial Selector Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              {tutorials.map((tutorial) => (
                <button
                  key={tutorial.part}
                  onClick={() => setActivePart(tutorial.part)}
                  className={`flex-1 py-4 px-6 font-semibold transition-all ${
                    activePart === tutorial.part
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg">{tutorial.title}</div>
                    <div
                      className={`text-sm mt-1 ${
                        activePart === tutorial.part
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {tutorial.duration}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Video */}
            {tutorials.map(
              (tutorial) =>
                activePart === tutorial.part && (
                  <div key={tutorial.part} className="p-6">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {tutorial.title}
                      </h2>
                      <p className="text-gray-600">{tutorial.description}</p>
                    </div>

                    {/* Video Player */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${tutorial.videoId}?rel=0&modestbranding=1`}
                        title={tutorial.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-6">
                      {tutorial.part > 1 ? (
                        <Button
                          variant="outline"
                          onClick={() => setActivePart(tutorial.part - 1)}
                        >
                          ← Previous Part
                        </Button>
                      ) : (
                        <div></div>
                      )}

                      {tutorial.part < tutorials.length && (
                        <Button
                          variant="primary"
                          onClick={() => setActivePart(tutorial.part + 1)}
                        >
                          Next Part →
                        </Button>
                      )}
                    </div>
                  </div>
                )
            )}
          </div>

          {/* Progress Tracker */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Your Progress
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  ✅ Purchased {orderData?.programName}
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 ${
                    activePart >= 1 ? "bg-green-100" : "bg-gray-100"
                  } rounded-full flex items-center justify-center mr-3`}
                >
                  {activePart >= 1 ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-gray-400">1</span>
                  )}
                </div>
                <span
                  className={
                    activePart >= 1 ? "text-gray-700" : "text-gray-400"
                  }
                >
                  {activePart >= 1 ? "✅" : "⏳"} Watch Tutorial Part 1
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 ${
                    activePart >= 2 ? "bg-green-100" : "bg-gray-100"
                  } rounded-full flex items-center justify-center mr-3`}
                >
                  {activePart >= 2 ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-gray-400">2</span>
                  )}
                </div>
                <span
                  className={
                    activePart >= 2 ? "text-gray-700" : "text-gray-400"
                  }
                >
                  {activePart >= 2 ? "✅" : "⏳"} Watch Tutorial Part 2
                </span>
              </div>
            </div>
          </div>

          {/* Need Help Section */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Have questions? Our support team is here to help you succeed.
            </p>
            <Button
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "mailto:support@middlemanceo.com";
              }}
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TutorialPage;

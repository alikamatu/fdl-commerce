"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqCategories = [
    {
      category: "General Questions",
      items: [
        {
          question: "What services does Forbes Digital Lifeline offer?",
          answer: "Forbes Digital Lifeline specializes in affordable laptops and mobile devices, professional unlocking and flashing services, comprehensive hardware and software repairs, application installations, and a wide selection of IT accessories and peripherals."
        },
        {
          question: "Where are you located and how can I contact you?",
          answer: "You may contact us via WhatsApp or telephone at +233 54 712 9636. For updates and promotional content, we invite you to follow our social media channels on Instagram and Snapchat @anointingforbes."
        },
        {
          question: "Do you offer delivery or pickup options?",
          answer: "Yes, we provide both delivery and pickup options for customer convenience. During the checkout process, you may select your preferred method. We collect necessary personal information to ensure accurate and timely delivery or pickup coordination."
        }
      ]
    },
    {
      category: "Technical Support",
      items: [
        {
          question: "What should I do if my device is not functioning properly?",
          answer: "You may bring your device to our service center or contact us for remote diagnostics. Our certified technicians will conduct a comprehensive assessment and recommend the most appropriate solution for your specific situation."
        },
        {
          question: "Can you recover lost data from my device?",
          answer: "Yes, we offer professional data recovery services for mobile devices, laptops, and various digital storage media. We employ secure, industry-standard methods to retrieve your data while maintaining strict confidentiality protocols throughout the process."
        }
      ]
    },
    {
      category: "Orders and Payments",
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept multiple payment methods including mobile money transfers, bank transfers, and cash payments to accommodate various customer preferences and ensure convenient transaction processing."
        },
        {
          question: "How long does order processing typically take?",
          answer: "The majority of orders are processed within 12 hours of receipt. Custom repairs or special orders may require additional time, and we maintain communication to provide updates throughout the processing period."
        }
      ]
    },
    {
      category: "Warranty and Repairs",
      items: [
        {
          question: "Do your products include warranty coverage?",
          answer: "Yes, all devices and accessories are covered by limited warranty protection. Specific warranty terms vary according to the product category and service provided, with detailed information available at the point of purchase."
        },
        {
          question: "What if my device experiences issues following repair?",
          answer: "We provide a comprehensive satisfaction guarantee. Should your device experience issues directly related to our repair services during the warranty period, we will address these concerns without additional charges to ensure your complete satisfaction."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Frequently Asked Questions & About Us
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find comprehensive answers to common questions and learn more about Forbes Digital Lifeline.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="group"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                  <h2 className="text-2xl font-semibold text-gray-800 whitespace-nowrap">
                    {category.category}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                </div>

                {/* FAQ Items */}
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = faqCategories
                      .slice(0, categoryIndex)
                      .reduce((acc, cat) => acc + cat.items.length, 0) + itemIndex;
                    const isOpen = openItems.has(globalIndex);

                    return (
                      <motion.div
                        key={itemIndex}
                        layout
                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                        whileHover={{ scale: 1.01 }}
                      >
                        <motion.button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-inset"
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-lg font-semibold text-gray-900 pr-8 leading-relaxed">
                            {item.question}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                            className="flex-shrink-0 ml-4 p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors"
                          >
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ 
                                opacity: 1, 
                                height: "auto",
                                transition: {
                                  height: { duration: 0.3, ease: "easeOut" },
                                  opacity: { duration: 0.2, delay: 0.1 }
                                }
                              }}
                              exit={{ 
                                opacity: 0, 
                                height: 0,
                                transition: {
                                  height: { duration: 0.2 },
                                  opacity: { duration: 0.1 }
                                }
                              }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6">
                                <div className="pl-4 border-l-2 border-blue-500/30">
                                  <motion.p 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-gray-700 leading-relaxed text-lg"
                                  >
                                    {item.answer}
                                  </motion.p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* About Us Section - 1/3 width */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="sticky top-8"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h2 className="text-2xl font-bold">About Forbes Digital Lifeline</h2>
                  <p className="text-gray-300 mt-2">Your Trusted Digital Partner</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Our Story
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Founded with a mission to make technology accessible and manageable for everyone, Forbes Digital Lifeline has grown from humble beginnings into a full-service digital hub offering comprehensive tech solutions.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      What We Do
                    </h3>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Affordable laptops and mobile devices
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Professional unlocking and flashing services
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        Hardware and software repairs
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        IT accessories and peripherals
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      Our Values
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-blue-400 mb-1">Integrity</div>
                        <div className="text-gray-400">Transparent & Honest</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-green-400 mb-1">Expertise</div>
                        <div className="text-gray-400">Certified Professionals</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-purple-400 mb-1">Customer Focus</div>
                        <div className="text-gray-400">Your Satisfaction First</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-orange-400 mb-1">Innovation</div>
                        <div className="text-gray-400">Cutting-edge Solutions</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="font-semibold text-white mb-3">Why Choose Us?</h3>
                    <div className="space-y-2 text-gray-300 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">⚡</span>
                        Quick turnaround times
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">💰</span>
                        Competitive pricing
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">🎯</span>
                        Personalized service
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">✅</span>
                        Guaranteed satisfaction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 border border-gray-200/60 shadow-sm">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <span className="text-2xl">💬</span>
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our dedicated support team is ready to assist you with any additional inquiries or specific concerns.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="https://wa.me/233547129636"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="mr-2">💬</span>
                  WhatsApp Support
                </motion.a>
                
                <motion.a
                  href="tel:+233547129636"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <span className="mr-2">📞</span>
                  Call Directly
                </motion.a>
              </div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-gray-500 mt-6"
              >
                Typically replies within 15 minutes
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
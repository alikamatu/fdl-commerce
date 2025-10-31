"use client";

import { useState } from "react";
import { CheckCircle, ChevronDown, ChevronUp, Clock, DollarSign, StarIcon } from "lucide-react";
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
          answer: "Yes, we provide free delivery and pickup options for customer convenience. During the checkout process, you may select your preferred method. We collect necessary personal information to ensure accurate and timely delivery or pickup coordination."
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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, services, and support processes.
          </p>
        </motion.div>

        {/* About Us Section - At the Top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl  -gray-200 p-8 mb-12 -sm"
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Logo Section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-shrink-0 lg:w-1/4"
            >
              <img 
                src="/logo/fdll.jpeg" 
                alt="Forbes Digital Lifeline" 
                className="w-48 h-48 rounded-2xl object-cover -md mx-auto lg:mx-0"
              />
            </motion.div>
            
            {/* Content Section */}
            <div className="flex-1 space-y-8">
              {/* Header */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  About Forbes Digital Lifeline
                </h2>
                <p className="text-xl text-blue-600 font-semibold">
                  Your Trusted Digital Partner
                </p>
              </div>

              {/* Our Story */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Story</h3>
                <p className="text-gray-700 leading-relaxed">
                  Founded with a mission to make technology accessible and manageable for everyone, 
                  Forbes Digital Lifeline has grown from humble beginnings into a full-service digital 
                  hub offering comprehensive tech solutions.
                </p>
              </div>

              {/* What We Do */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Do</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">Affordable laptops and mobile devices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">Professional unlocking and flashing services</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">Hardware and software repairs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700">IT accessories and peripherals</span>
                  </div>
                </div>
              </div>

              {/* Our Values */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Values</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg  -blue-100">
                    <div className="font-semibold text-blue-700 mb-1">Integrity</div>
                    <div className="text-sm text-blue-600">Transparent & Honest</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg  -green-100">
                    <div className="font-semibold text-green-700 mb-1">Expertise</div>
                    <div className="text-sm text-green-600">Certified Professionals</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg  -purple-100">
                    <div className="font-semibold text-purple-700 mb-1">Customer Focus</div>
                    <div className="text-sm text-purple-600">Your Satisfaction First</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg  -orange-100">
                    <div className="font-semibold text-orange-700 mb-1">Innovation</div>
                    <div className="text-sm text-orange-600">Cutting-edge Solutions</div>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Choose Us?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg  -gray-200 flex flex-col items-center">
                    <div className="text-2xl mb-2"><Clock /></div>
                    <div className="font-medium text-gray-900">Quick turnaround times</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg  -gray-200 flex flex-col items-center">
                    <div className="text-2xl mb-2"><DollarSign /></div>
                    <div className="font-medium text-gray-900">Competitive pricing</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg  -gray-200 flex flex-col items-center">
                    <div className="text-2xl mb-2"><StarIcon /></div>
                    <div className="font-medium text-gray-900">Personalized service</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg  -gray-200 flex flex-col items-center">
                    <div className="text-2xl text-center mb-2"><CheckCircle /></div>
                    <div className="font-medium text-gray-900">Guaranteed satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + categoryIndex * 0.1 }}
              className="bg-white rounded-2xl  -gray-200 overflow-hidden -sm"
            >
              {/* Category Header */}
              <div className="bg-gray-50 px-6 py-4 -b -gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {category.category}
                </h2>
              </div>
              
              {/* FAQ Items */}
              <div className="divide-y divide-gray-100">
                {category.items.map((item, itemIndex) => {
                  const globalIndex = faqCategories
                    .slice(0, categoryIndex)
                    .reduce((acc, cat) => acc + cat.items.length, 0) + itemIndex;
                  const isOpen = openItems.has(globalIndex);

                  return (
                    <div key={itemIndex} className="transition-colors hover:bg-gray-50/50">
                      <motion.button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.8)" }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-lg font-medium text-gray-900 pr-8 leading-relaxed">
                          {item.question}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0 ml-4 p-2 rounded-full bg-white  -gray-200"
                        >
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
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
                              <div className="pl-4 -l-2 -blue-500">
                                <motion.p 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="text-gray-700 leading-relaxed"
                                >
                                  {item.answer}
                                </motion.p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-8  -gray-200">
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-2xl text-white">💬</span>
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-8">
                Our support team is here to help you with any additional inquiries.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="https://wa.me/233547129636"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span className="mr-2">💬</span>
                  WhatsApp Support
                </motion.a>
                
                <motion.a
                  href="tel:+233547129636"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg  -gray-300 hover:-gray-400 transition-colors"
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
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Privacy Policy & Return Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-8 border border-gray-200/60">
            {/* Privacy Policy Sections */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Privacy Policy</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h3>
                  <p className="text-gray-700 leading-relaxed">
                    At Forbes Digital Lifeline, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our services, visit our website, or interact with us.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    By accessing our services, you acknowledge that you have read and understood this Privacy Policy. We encourage you to review this policy periodically to stay informed about our privacy practices.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                      <ul className="text-gray-700 space-y-2">
                        <li>• Contact details and identification information</li>
                        <li>• Delivery and billing addresses</li>
                        <li>• Payment information and transaction history</li>
                        <li>• Communication preferences and service inquiries</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Technical Information</h4>
                      <ul className="text-gray-700 space-y-2">
                        <li>• Device specifications and service history</li>
                        <li>• Website interaction data and analytics</li>
                        <li>• Technical specifications and performance metrics</li>
                        <li>• Customer feedback and service ratings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h3>
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3">•</span>
                        To process and fulfill your orders and service requests efficiently
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3">•</span>
                        To provide comprehensive technical support and customer assistance
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3">•</span>
                        To enhance our service offerings and website functionality
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-3">•</span>
                        To communicate important updates and security notifications
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection and Security</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We implement comprehensive security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our security protocols include secure server infrastructure, data encryption, restricted access controls, and regular security audits.
                  </p>
                </div>
              </div>
            </section>

            {/* Return Policy Sections */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-green-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Return Policy</h2>
              </div>

              <div className="space-y-8">
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    At Forbes Digital Lifeline, customer satisfaction is our top priority. We strive to ensure that every product and service meets your expectations. Our Return Policy outlines the steps and conditions for returning items to ensure a transparent and fair process for all customers.
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Eligibility for Returns</h3>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-3">✓</span>
                        Products must be returned within 7 days of purchase date
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-3">✓</span>
                        Items must be in original condition, unused, with all packaging intact
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-3">✓</span>
                        Original receipt or proof of purchase must be provided
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-3">✓</span>
                        All accessories and documentation must be included
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Non-Returnable Items</h3>
                  <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                    <ul className="text-gray-700 space-y-3">
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">•</span>
                        Customized or flashed devices and software
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">•</span>
                        Devices with physical damage not caused by Forbes Digital Lifeline
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">•</span>
                        Services such as virus removal, data recovery, or software troubleshooting
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-500 mr-3">•</span>
                        Digital services once delivered or activated
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Return Process</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">1</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Contact Support</h4>
                          <p className="text-gray-700">Initiate return via WhatsApp or phone with proof of purchase</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">2</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Assessment</h4>
                          <p className="text-gray-700">Our team evaluates the return request and condition</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">3</div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Resolution</h4>
                          <p className="text-gray-700">We process refunds or exchanges as appropriate</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Refunds & Exchanges</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Refund Processing</h4>
                        <p className="text-gray-700 text-sm">Approved refunds processed within 5-10 business days via original payment method</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Exchanges</h4>
                        <p className="text-gray-700 text-sm">Replacements of equal or higher value with price differences settled upfront</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Customer Responsibility</h4>
                        <p className="text-gray-700 text-sm">Return delivery costs unless item was defective or incorrect</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-gray-200 mb-6">
                For questions regarding our Privacy Policy or Return Policy, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Privacy Concerns</h3>
                  <div className="space-y-2 text-gray-200">
                    <p>Email: privacy@forbesdigitals.com</p>
                    <p>Telephone: +233 54 712 9636</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Returns & Support</h3>
                  <div className="space-y-2 text-gray-200">
                    <p>WhatsApp: +233 54 712 9636</p>
                    <p>Email: returns@forbesdigitals.com</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
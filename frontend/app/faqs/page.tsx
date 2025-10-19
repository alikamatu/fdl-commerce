export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">What is Forbes Digital LifeLine?</h2>
            <p className="text-lg text-foreground/80">
              Forbes Digital LifeLine is a platform dedicated to providing insightful articles and resources on digital transformation, technology trends, and innovation in various industries.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">How can I contribute to Forbes Digital LifeLine?</h2>
            <p className="text-lg text-foreground/80">
              We welcome contributions from industry experts, writers, and thought leaders. You can reach out to us via our contact page with your article ideas or proposals.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">How often is new content published?</h2>
            <p className="text-lg text-foreground/80">
              We strive to publish new articles and resources on a weekly basis to keep our readers informed about the latest trends and insights in the digital world.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Can I subscribe to updates?</h2>
            <p className="text-lg text-foreground/80">
              Yes! You can subscribe to our newsletter to receive regular updates on new articles, events, and exclusive content directly in your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
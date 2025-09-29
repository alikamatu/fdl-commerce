export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <section className="w-full py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-primary">TechStore</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover the latest electronics - laptops, mobile phones, and accessories at unbeatable prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products" 
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Shop Now
            </a>
            <a 
              href="/products/laptops" 
              className="px-8 py-3 border border-primary text-primary rounded-lg hover:bg-accent transition-colors font-medium"
            >
              Browse Laptops
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
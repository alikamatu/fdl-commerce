export default function ServicesPage() {
  return (
    <main className="bg-background flex items-center justify-center p-8">
      <video
        src="/images/FDL.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        controls={false}
        className="object-cover"
      />
    </main>
  );
}

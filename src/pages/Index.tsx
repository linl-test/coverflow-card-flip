import CoverflowCarousel from "@/components/CoverflowCarousel";

const carouselItems = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&h=800&fit=crop",
    title: "Neon Dreams",
    subtitle: "Electronic · 2024",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=800&fit=crop",
    title: "Midnight Sessions",
    subtitle: "Jazz · Live Album",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=640&h=800&fit=crop",
    title: "Aurora",
    subtitle: "Ambient · Relaxation",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&h=800&fit=crop",
    title: "Echoes",
    subtitle: "Progressive · 2024",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=640&h=800&fit=crop",
    title: "City Lights",
    subtitle: "Synthwave · EP",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=640&h=800&fit=crop",
    title: "Stellar",
    subtitle: "Indie · Single",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=640&h=800&fit=crop",
    title: "Wanderlust",
    subtitle: "World Music · 2024",
  },
];

const Index = () => {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">
          Featured Albums
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover your next favorite sound
        </p>
      </header>

      {/* Carousel */}
      <CoverflowCarousel items={carouselItems} />

      {/* Keyboard hint */}
      <p className="mt-8 text-muted-foreground/50 text-xs tracking-widest uppercase">
        Click cards to navigate
      </p>
    </main>
  );
};

export default Index;

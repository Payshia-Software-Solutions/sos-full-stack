import Image from 'next/image';

export default function AboutUs() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center px-4 md:px-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">About Ceylon Pharma College</h2>
          <p className="mt-4 text-muted-foreground font-body leading-relaxed">
            Founded with a vision to be a center of excellence in pharmaceutical education and research, Ceylon Pharma College has been a cornerstone of the healthcare community for over two decades. Our mission is to nurture knowledgeable, skilled, and ethical pharmacy professionals who can contribute effectively to the ever-evolving global health landscape.
          </p>
          <p className="mt-4 text-muted-foreground font-body leading-relaxed">
            We are fully accredited by the National Pharmacy Council and affiliated with leading universities. Our state-of-the-art facilities, experienced faculty, and a curriculum that blends theory with hands-on practice ensure our graduates are well-prepared for successful careers.
          </p>
        </div>
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="https://placehold.co/600x400.png"
            alt="The modern facade of the Ceylon Pharma College building"
            fill
            className="object-cover"
            data-ai-hint="modern building"
          />
        </div>
      </div>
    </section>
  );
}

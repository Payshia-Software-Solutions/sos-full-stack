import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import College from "@/components/College";
import Book from "@/components/Book";
import Press from "@/components/Press";
import Speaking from "@/components/Speaking";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <College />
        <Book />
        <Press />
        <Speaking />
        <Blog />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

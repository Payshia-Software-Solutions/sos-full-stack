"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from '@/context/language-context';
import { 
  Play, 
  ExternalLink,
  Clock,
  Film
} from 'lucide-react';

interface VideoItem {
  id: string;
  titleEn: string;
  titleSi: string;
  titleTa: string;
  tagEn: string;
  tagSi: string;
  tagTa: string;
  duration: string;
  descriptionEn: string;
  descriptionSi: string;
}

const videos: VideoItem[] = [
  {
    id: "XvazXU-saP4",
    titleEn: "Annual Grand Convocation & Awarding Ceremony at BMICH",
    titleSi: "BMICH හි පැවති වාර්ෂික මහා උපාධි ප්‍රදානෝත්සවය (Grand Convocation)",
    titleTa: "BMICH இல் நடைபெற்ற வருடாந்த பட்டமளிப்பு விழா",
    tagEn: "Convocation",
    tagSi: "උපාධි ප්‍රදානය",
    tagTa: "பட்டமளிப்பு",
    duration: "6:25",
    descriptionEn: "Celebrating certified pharmacy graduates alongside healthcare industry leaders at BMICH.",
    descriptionSi: "සෞඛ්‍ය ක්ෂේත්‍රයේ ප්‍රවීණයින්ගේ සහභාගීත්වයෙන් BMICH හි පැවති වාර්ෂික මහා උපාධි ප්‍රදානෝත්සවය.",
  },
  {
    id: "fCFonZdEZGg",
    titleEn: "Student Experiences & Real-Life Campus Testimonials",
    titleSi: "ශිෂ්‍ය අත්දැකීම් සහ සත්‍ය ප්‍රතිචාර (Student Testimonials)",
    titleTa: "மாணவர் அனுபவங்கள் மற்றும் வளாக வாழ்க்கை",
    tagEn: "Student Stories",
    tagSi: "ශිෂ්‍ය හඬ",
    tagTa: "மாணவர் குரல்",
    duration: "3:40",
    descriptionEn: "Graduates and current students share their firsthand experiences studying pharmacy with Ceylon Pharma College.",
    descriptionSi: "අපගේ උපාධිධාරී සහ වත්මන් සිසුන් තමන් ලැබූ ප්‍රායෝගික ඖෂධවේදී පුහුණු අත්දැකීම් විස්තර කරයි.",
  },
  {
    id: "d-aWudT5_3s",
    titleEn: "Practical Dispensing & Computer Simulation Training",
    titleSi: "ප්‍රායෝගික ඖෂධ නිකුත් කිරීම සහ පරිගණක සමාකරණ පුහුණුව",
    titleTa: "நடைமுறை மருந்தகம் மற்றும் உருவகப்படுத்துதல் பயிற்சி",
    tagEn: "Practical Labs",
    tagSi: "ප්‍රායෝගික පුහුණුව",
    tagTa: "நடைமுறை பயிற்சி",
    duration: "5:10",
    descriptionEn: "Inside our hands-on pharmacy simulation games, prescription interpretation, and dosage calculations.",
    descriptionSi: "සැබෑ බෙහෙත් වට්ටෝරු කියවීම, ඖෂධ පරිගණක ක්‍රීඩා සහ රෝගී උපදේශන කුසලතා පුහුණු සැසිය.",
  },
  {
    id: "pqPiXXjDyAE",
    titleEn: "A Message from Our Chairman & Course Director",
    titleSi: "සභාපතිතුමාගේ සහ පාඨමාලා අධ්‍යක්ෂකතුමාගේ පණිවිඩය",
    titleTa: "தலைவரின் சிறப்புச் செய்தி",
    tagEn: "Director's Message",
    tagSi: "අධ්‍යක්ෂක පණිවිඩය",
    tagTa: "தலைமைத்துவ செய்தி",
    duration: "4:50",
    descriptionEn: "Our visionary leadership discusses the evolving pharmaceutical sector and professional standards.",
    descriptionSi: "ශ්‍රී ලංකාවේ ඖෂධවේදී ක්ෂේත්‍රයේ වෘත්තීය අනාගතය සහ ආයතනික දැක්ම පිළිබඳ පණිවිඩය.",
  },
  {
    id: "oRBmtQicXG4",
    titleEn: "Ceylon Pharma College - A Journey of Excellence",
    titleSi: "සිලෝන් ෆාමා විද්‍යාලය - විශිෂ්ටත්වයේ ගමන් මග",
    titleTa: "சிலோன் பார்மா கல்லூரி - சிறப்பான பயணம்",
    tagEn: "Campus Journey",
    tagSi: "විශිෂ්ටත්වයේ ගමන් මග",
    tagTa: "சிறப்பான பயணம்",
    duration: "4:15",
    descriptionEn: "National feature discussing modern practical pharmacy training and student career development.",
    descriptionSi: "ප්‍රායෝගික ඖෂධවේදී අධ්‍යාපනය සහ ශිෂ්‍ය වෘත්තීය සංවර්ධනය පිළිබඳ විශේෂාංගය.",
  },
];

export default function Achievements() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const { language } = useTranslation();
  const isSinhala = language === 'si';
  const isTamil = language === 'ta';

  const selectedVideo = videos[selectedIndex];

  const getTitle = (v: VideoItem) => isSinhala ? v.titleSi : isTamil ? v.titleTa : v.titleEn;
  const getTag = (v: VideoItem) => isSinhala ? v.tagSi : isTamil ? v.tagTa : v.tagEn;
  const getDesc = (v: VideoItem) => isSinhala ? v.descriptionSi : v.descriptionEn;

  return (
    <section 
      id="achievements" 
      className="w-full py-5 md:py-7 bg-slate-50/70 dark:bg-card/30 border-y border-border/50 overflow-hidden"
    >
      {/* Container matching Navbar's exact alignment & width */}
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Bar perfectly aligned with Navbar boundaries */}
        <div className="w-full mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Badge 
              variant="outline" 
              className="w-fit px-2.5 py-0.5 text-xs font-semibold text-primary border-primary/30 bg-primary/5 gap-1.5 inline-flex items-center shrink-0"
            >
              <Film className="w-3 h-3 text-primary" />
              <span>
                {isSinhala ? 'විද්‍යාලයීය අත්දැකීම් සහ ජයග්‍රහණ' : 'Campus Milestones & Video Highlights'}
              </span>
            </Badge>

            <h2 className={cn(
              "text-lg sm:text-xl md:text-2xl font-headline font-bold text-foreground tracking-tight",
              isSinhala ? "leading-[1.3]" : "leading-tight"
            )}>
              {isSinhala 
                ? 'අපගේ සිසුන්ගේ ගමන් මග සහ ජයග්‍රහණ' 
                : 'Experience Ceylon Pharma College in Action'}
            </h2>
          </div>

          <p className="text-xs text-muted-foreground font-body hidden md:block">
            {isSinhala 
              ? 'BMICH උපාධි ප්‍රදානෝත්සවය, ප්‍රායෝගික පුහුණුව සහ සිසු අත්දැකීම්' 
              : 'Annual BMICH convocation, hands-on lab training & student stories'}
          </p>
        </div>

        {/* Side-by-Side Console matching Navbar left/right limits */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 xl:gap-5 items-stretch">
          
          {/* Left Column: 16:9 Video Player (Col 8) */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl overflow-hidden border border-border/80 bg-background shadow-md">
            
            {/* 16:9 Video Frame */}
            <div className="relative aspect-video w-full bg-zinc-950 max-h-[calc(100vh-230px)] flex-1">
              <iframe
                key={selectedVideo.id}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0&autoplay=0`}
                title={getTitle(selectedVideo)}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Clean Video Meta Bottom Bar */}
            <div className="p-3 sm:p-3.5 bg-background border-t border-border/70 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20 py-0">
                    {getTag(selectedVideo)}
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{selectedVideo.duration}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span>{isSinhala ? 'දැනට ධාවනය වේ' : 'Now Playing'}</span>
                  </span>
                </div>

                <h3 className="font-headline font-bold text-xs sm:text-sm text-foreground truncate">
                  {getTitle(selectedVideo)}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1.5 rounded-lg border-border hover:bg-muted font-medium px-2.5">
                  <a 
                    href={`https://www.youtube.com/watch?v=${selectedVideo.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Side Panel (Col 4) */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl border border-border/80 bg-background shadow-md p-2.5 sm:p-3 overflow-hidden">
            
            {/* Side Panel Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-primary" />
                <span>{isSinhala ? 'වීඩියෝ මාලාව (5)' : 'Video Playlist (5)'}</span>
              </span>
              <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {selectedIndex + 1} / {videos.length}
              </span>
            </div>

            {/* Side Panel Thumbnails List */}
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:flex-1 snap-x scrollbar-none">
              {videos.map((video, idx) => {
                const isCurrent = selectedIndex === idx;

                return (
                  <button
                    key={video.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={cn(
                      "text-left rounded-xl p-1.5 sm:p-2 transition-all duration-200 flex items-center gap-2.5 group shrink-0 lg:shrink border w-[250px] sm:w-[270px] lg:w-full snap-start cursor-pointer",
                      isCurrent
                        ? "bg-primary/10 border-primary ring-1 ring-primary/40 shadow-sm"
                        : "bg-card/40 border-border/60 hover:bg-muted/70 hover:border-border"
                    )}
                    aria-current={isCurrent}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-video w-20 sm:w-24 shrink-0 rounded-lg overflow-hidden bg-black/10 border border-border/60">
                      <Image
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={getTitle(video)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Play overlay */}
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-all",
                        isCurrent ? "bg-primary/25" : "bg-black/20 group-hover:bg-black/10"
                      )}>
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shadow transition-transform",
                          isCurrent 
                            ? "bg-primary text-primary-foreground scale-105" 
                            : "bg-white/95 text-foreground group-hover:scale-105"
                        )}>
                          <Play className="w-2 h-2 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Duration */}
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[8px] font-mono px-1 rounded">
                        {video.duration}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-wider truncate",
                          isCurrent ? "text-primary font-bold" : "text-muted-foreground"
                        )}>
                          {getTag(video)}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] font-bold text-primary bg-primary/15 px-1 py-0.2 rounded border border-primary/25 shrink-0">
                            PLAYING
                          </span>
                        )}
                      </div>

                      <h4 className={cn(
                        "font-headline text-xs leading-snug line-clamp-2",
                        isCurrent ? "text-primary font-bold" : "text-foreground group-hover:text-primary font-medium"
                      )}>
                        {getTitle(video)}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

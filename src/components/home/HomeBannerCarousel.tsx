import { translate } from "../../features/i18n/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

interface HomeBannerCarouselProps {
  images: string[];
  reverseDirection?: boolean;
  rowKey: string;
}

const bannerDimensions: Record<string, readonly [number, number]> = {
  "/img/Frame 33.png": [568, 248],
  "/img/Frame 34.png": [276, 248],
  "/img/Frame 35.png": [853, 248],
  "/img/Frame 36.png": [92, 248],
  "/img/Frame 366.png": [258, 248],
  "/img/Rectangle 3.png": [422, 248],
};

const getOptimizedBanner = (src: string): string =>
  src.replace("/img/", "/img/optimized/").replace(/\.png$/u, ".webp");

export default function HomeBannerCarousel({ images, reverseDirection = false, rowKey }: HomeBannerCarouselProps) {
  const slides = [...images, ...images];

  return (
    <Swiper modules={[Autoplay]} autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true, reverseDirection }} loop slidesPerView="auto" spaceBetween={20} speed={600} grabCursor className="w-full overflow-hidden py-1">
      {slides.map((src, index) => (
        <SwiperSlide key={`${rowKey}-${index}`} className="w-auto!">
          <div className="flex h-[250px] cursor-grab overflow-hidden rounded-[20px] bg-[#f8f8f8] shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] active:cursor-grabbing [@media(max-width:640px)]:h-[160px] [@media(max-width:480px)]:h-[135px]">
            <img
              src={getOptimizedBanner(src)}
              alt={translate("Kampanya Banner")}
              width={bannerDimensions[src]?.[0] ?? 568}
              height={bannerDimensions[src]?.[1] ?? 248}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "low"}
              decoding="async"
              className="pointer-events-none block h-full w-auto max-w-full select-none rounded-[20px] object-cover [-webkit-user-drag:none]"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);

  // Use multiple image variants if available, otherwise repeat the same image
  const galleryImages = images.length > 0 ? [images[0], images[0], images[0], images[0]] : [];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main Image Display */}
      <div className="space-y-4">
        {/* Large Image with Zoom */}
        <div
          className="relative w-full aspect-square bg-app-cream rounded-2xl overflow-hidden group cursor-zoom-in"
          onClick={() => setShowZoom(true)}
        >
          <img
            src={galleryImages[selectedIndex]}
            alt={`${productName} - View ${selectedIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />

          {/* Zoom Icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="size-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-5 text-app-text" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="size-5 text-app-text" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {galleryImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? "border-app-green ring-2 ring-app-green/50"
                    : "border-app-border hover:border-app-green/50"
                }`}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Info */}
        <div className="bg-app-cream rounded-lg p-3 flex items-center gap-2">
          <ZoomIn className="size-4 text-app-green" />
          <p className="text-xs text-app-text-light">
            انقر على الصورة لتكبيرها والرؤية بشكل أفضل
          </p>
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoom && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="size-6 text-white" />
          </button>

          {/* Zoomed Image */}
          <div className="relative w-full max-w-2xl max-h-[90vh]">
            <img
              src={galleryImages[selectedIndex]}
              alt={`${productName} zoomed`}
              className="w-full h-full object-contain"
            />

            {/* Navigation in Zoom */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <ChevronLeft className="size-6 text-white" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <ChevronRight className="size-6 text-white" />
                </button>
              </>
            )}

            {/* Counter in Zoom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              {selectedIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;

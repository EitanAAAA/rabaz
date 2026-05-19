import Image from "next/image";

const galleryImages = [
  "/arc-gallery/arc-01.jpg",
  "/arc-gallery/arc-02.jpg",
  "/arc-gallery/arc-03.jpg",
  "/arc-gallery/arc-04.jpg",
  "/arc-gallery/arc-05.jpg",
  "/arc-gallery/arc-06.jpg",
  "/arc-gallery/arc-07.webp",
  "/arc-gallery/arc-08.jpg",
  "/arc-gallery/arc-09.jpg",
  "/arc-gallery/arc-10.jpg",
  "/arc-gallery/arc-11.jpg",
  "/arc-gallery/arc-12.jpg"
];

const smileImages = [...galleryImages, ...galleryImages.slice(0, 4)];

export default function PictureArcStacks() {
  return (
    <div className="bottom-curve-carousel" aria-hidden="true">
      <div className="bottom-curve-track">
        <div className="bottom-curve-set">
          {smileImages.map((src, index) => (
            <div className="bottom-curve-card" key={`${src}-${index}`}>
              <Image src={src} alt="" width={240} height={152} sizes="170px" priority={index < 8} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

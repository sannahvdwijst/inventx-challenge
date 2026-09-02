export function VideoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cap-navy">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/video/starfield-poster.jpg"
        className="h-full w-full object-cover opacity-40"
      >
        <source src="/video/starfield-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-cap-navy/60" />
    </div>
  );
}

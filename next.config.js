/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Only optimize images from hosts we actually expect (seed data + your own
    // storage bucket, once you add one). Do NOT widen this to "**" — the image
    // optimizer fetches whatever URL it's given server-side, so an open pattern
    // turns "paste an image URL" into an SSRF vector.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Add your S3/R2/CDN hostname here once you wire up real uploads, e.g.:
      // { protocol: "https", hostname: "your-bucket.s3.amazonaws.com" },
    ],
  },
};

module.exports = nextConfig;

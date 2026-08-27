import Script from "next/script";

/**
 * Browser-side GA4 configuration.
 *
 * Renders nothing unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, so local
 * development never reports traffic. Only the measurement ID is public here —
 * `GA_API_SECRET` is server-only and is not referenced in this file.
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}

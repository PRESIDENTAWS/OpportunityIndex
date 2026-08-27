import Script from "next/script";
import { safeGaMeasurementId } from "@/lib/analytics/constants";

/**
 * Browser-side GA4 configuration.
 *
 * Renders nothing unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, so local
 * development never reports traffic. Only the measurement ID is public here —
 * `GA_API_SECRET` is server-only and is not referenced in this file.
 */
export function GoogleAnalytics() {
  // Validated before interpolation: this value is written into an inline
  // <script>, so a malformed or hostile ID would be script injection. A bad
  // value is refused and logged rather than escaped.
  const measurementId = safeGaMeasurementId();
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

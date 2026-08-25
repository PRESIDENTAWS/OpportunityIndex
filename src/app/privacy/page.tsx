import type { Metadata } from "next";
import { PageHeader } from "@/components/PageShell";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What we collect, why, and how to have it removed.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" description="What we collect, why, and how to have it removed." />
      <div className="container-oi py-8">
        <Prose>
          <p>
            Last updated August 2026. This policy covers opportunityindex.com.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Analytics.</strong> Aggregate page views and referrers, used to
              decide what to research next. No profiles are built from this.
            </li>
            <li>
              <strong>Newsletter email addresses,</strong> when you give one. Used only
              to send the newsletter you asked for.
            </li>
            <li>
              <strong>Messages you send us,</strong> retained so we can follow up on
              corrections and listings.
            </li>
          </ul>

          <h2>What we do not do</h2>
          <p>
            We do not sell personal information, and we do not share your email address
            with advertisers or sponsors. Calculators on this site run entirely in your
            browser — the figures you enter are never transmitted to us.
          </p>

          <h2>Advertising</h2>
          <p>
            Advertising placements may set their own cookies subject to the ad
            provider&rsquo;s policy. Sponsored placements are labelled wherever they appear.
          </p>

          <h2>Your choices</h2>
          <p>
            Every newsletter has a one-click unsubscribe. To request deletion of any
            data we hold about you, email privacy@opportunityindex.com and we will
            action it within 30 days.
          </p>
        </Prose>
      </div>
    </>
  );
}

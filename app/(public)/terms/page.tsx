import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Ecsendia Autos. Read our terms governing the use of our vehicle listing and inquiry platform.',
}

const lastUpdated = 'February 27, 2026'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10 prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">

            <p>
              Welcome to Ecsendia Autos. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website and vehicle inquiry platform (the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, please discontinue use of the Service immediately.
            </p>

            <h2>1. About the Service</h2>
            <p>
              Ecsendia Autos operates an online vehicle listing and inquiry platform that allows prospective buyers to browse available used cars and submit inquiries to our sales team. The Service is operated from Lagos, Nigeria and is primarily intended for users located in Nigeria, though anyone may access it.
            </p>
            <p>
              We are a dealer, not a marketplace — all vehicles listed on our platform are sold by Ecsendia Autos directly. We are not a broker, agent, or intermediary acting on behalf of private sellers.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              By using our Service, you confirm that:
            </p>
            <ul>
              <li>You are at least 18 years of age.</li>
              <li>You have the legal capacity to enter into a binding agreement under Nigerian law.</li>
              <li>You are accessing the Service for lawful purposes only.</li>
            </ul>

            <h2>3. Vehicle Listings</h2>

            <h3>3.1 Accuracy of Information</h3>
            <p>
              We make every effort to ensure that vehicle listings — including descriptions, specifications, photographs, and prices — are accurate and up to date. However, we do not guarantee that all information is error-free. Specifications, prices, and availability are subject to change without notice.
            </p>
            <p>
              All listings are subject to prior sale. The presence of a vehicle on our platform does not constitute a reservation, guarantee of availability, or binding offer to sell.
            </p>

            <h3>3.2 Pricing</h3>
            <p>
              All prices displayed on this platform are in Nigerian Naira (₦, NGN) unless otherwise stated. Prices are asking prices only and do not include any applicable taxes, registration fees, duties, or logistics costs unless explicitly stated in the listing.
            </p>

            <h3>3.3 Vehicle Condition</h3>
            <p>
              Condition descriptions (e.g., &quot;Clean Title&quot;, &quot;Rebuilt Title&quot;) reflect the information available to us at the time of listing. We recommend that all prospective buyers conduct their own independent inspection before committing to a purchase.
            </p>

            <h2>4. Inquiry Submissions</h2>

            <h3>4.1 Nature of Inquiries</h3>
            <p>
              Submitting an inquiry form on our platform is not a binding offer to purchase, a reservation, or any form of legal commitment. It is a request for further information, and our team will follow up with you to discuss the vehicle.
            </p>

            <h3>4.2 Accurate Information</h3>
            <p>
              You agree to provide accurate, truthful, and current information when completing an inquiry form. Submitting false, misleading, or fraudulent information is a breach of these Terms and may result in your access to the Service being restricted.
            </p>

            <h3>4.3 No Spam or Abuse</h3>
            <p>
              You may not use our inquiry forms to send unsolicited commercial messages, test submissions, or any content that is offensive, defamatory, or unlawful.
            </p>

            <h2>5. No Binding Contract Until Signed</h2>
            <p>
              No vehicle sale is legally binding until a written sale agreement has been signed by both parties and any required deposit or payment has been received and confirmed by Ecsendia Autos. Verbal agreements, WhatsApp messages, or email correspondence do not constitute a binding sale agreement unless explicitly confirmed in writing by an authorised representative of Ecsendia Autos.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
              All content on this platform — including text, images, vehicle photographs, logos, and software — is the property of Ecsendia Autos or licensed to us by third parties. You may not reproduce, distribute, modify, or use our content for commercial purposes without our express written permission.
            </p>
            <p>
              Vehicle photographs may be used for personal reference purposes only (e.g., sharing a listing with a family member). Any other use requires prior written consent.
            </p>

            <h2>7. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Attempt to gain unauthorised access to any part of our platform or backend systems.</li>
              <li>Use automated scripts, bots, or scrapers to extract data from our platform.</li>
              <li>Impersonate another person or entity when submitting inquiries.</li>
              <li>Use the Service to facilitate any fraudulent or illegal transaction.</li>
              <li>Post, transmit, or distribute any harmful, offensive, or unlawful content.</li>
              <li>Circumvent or attempt to bypass any security measure on our platform.</li>
            </ul>

            <h2>8. Disclaimers and Limitation of Liability</h2>

            <h3>8.1 Service Provided &quot;As Is&quot;</h3>
            <p>
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, whether express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or harmful components.
            </p>

            <h3>8.2 No Liability for Third-Party Actions</h3>
            <p>
              We are not responsible for the actions of third-party logistics providers, mechanics, inspection services, or any other party you engage in connection with a vehicle purchase.
            </p>

            <h3>8.3 Limitation</h3>
            <p>
              To the fullest extent permitted by Nigerian law, Ecsendia Autos shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.
            </p>

            <h2>9. Third-Party Links</h2>
            <p>
              Our platform may contain links to external websites. These links are provided for convenience only. We do not endorse, and are not responsible for, the content or practices of any third-party websites. Accessing those sites is at your own risk.
            </p>

            <h2>10. Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-maroon-700 hover:underline">Privacy Policy</Link>,
              which is incorporated into these Terms by reference. By using the Service, you consent to the data practices described in that Policy.
            </p>

            <h2>11. Modifications to the Service or Terms</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice. We may also update these Terms at any time. The &quot;Last Updated&quot; date at the top of this page will reflect the most recent revision. Your continued use of the Service following any change constitutes acceptance of the revised Terms.
            </p>

            <h2>12. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any dispute arising from these Terms or your use of the Service shall first be subject to good-faith negotiation. If not resolved within 30 days, the dispute shall be referred to the jurisdiction of the courts of Lagos State, Nigeria.
            </p>

            <h2>13. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Ecsendia Autos with respect to the Service and supersede all prior agreements, representations, and understandings.
            </p>

            <h2>14. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us:
            </p>
            <address className="not-italic">
              <strong>Ecsendia Autos</strong><br />
              Lagos, Nigeria<br />
              Email: <a href="mailto:autosales@ecsendia.site" className="text-maroon-700 hover:underline">autosales@ecsendia.site</a><br />
              Phone: <a href="tel:+2349138863986" className="text-maroon-700 hover:underline">+234 913 886 3986</a>
            </address>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

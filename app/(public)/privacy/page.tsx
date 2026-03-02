import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Ecsendia Autos. Learn how we collect, use, and protect your personal information.',
}

const lastUpdated = 'February 27, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10 prose prose-gray max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">

            <p>
              Ecsendia Autos (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your personal information. This Privacy Policy explains what data we collect when you use our website and vehicle inquiry services, how we use it, and your rights regarding that data. By using our platform, you agree to the practices described in this Policy.
            </p>

            <h2>1. Information We Collect</h2>

            <h3>a. Information You Provide Directly</h3>
            <p>
              When you submit an inquiry form — either on an individual vehicle listing or through our general contact page — we collect the following information:
            </p>
            <ul>
              <li><strong>Full Name</strong> — to address you appropriately in communications.</li>
              <li><strong>Phone Number</strong> — your preferred contact number for follow-up.</li>
              <li><strong>Email Address</strong> — for electronic correspondence.</li>
              <li><strong>Preferred Contact Method</strong> — phone call, WhatsApp, or email.</li>
              <li><strong>Vehicle Interest</strong> — the specific car you are enquiring about, including its price.</li>
              <li><strong>Budget &amp; Offer Information</strong> — optional fields indicating your budget range or counter-offer.</li>
              <li><strong>Shipping Details</strong> — if you request delivery assistance (city, state, postal code).</li>
              <li><strong>Payment Preference</strong> — e.g., full payment, instalment plan.</li>
              <li><strong>Additional Notes</strong> — any free-text message you choose to share.</li>
            </ul>

            <h3>b. Automatically Collected Information</h3>
            <p>
              When you visit our website, we automatically collect certain technical data:
            </p>
            <ul>
              <li>IP address and approximate geographic location</li>
              <li>Browser type and version</li>
              <li>Device type (desktop, mobile, tablet)</li>
              <li>Pages viewed and time spent on those pages</li>
              <li>Referring website or search query that brought you to us</li>
            </ul>
            <p>
              This data is collected via server logs and, where applicable, cookies. See Section 6 for our Cookie Policy.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the data we collect for the following purposes:</p>
            <ul>
              <li><strong>To respond to your inquiry</strong> — our sales team will contact you via your preferred method to discuss the vehicle you are interested in.</li>
              <li><strong>To improve our service</strong> — understanding how users interact with our site helps us present inventory more effectively.</li>
              <li><strong>To prevent fraud and abuse</strong> — IP addresses and usage patterns help us identify and block malicious activity.</li>
              <li><strong>To send relevant communications</strong> — with your consent, we may send you updates about vehicles matching your interests, promotions, or news from Ecsendia Autos. You may opt out at any time.</li>
              <li><strong>To comply with legal obligations</strong> — where required by Nigerian law or a lawful court order.</li>
            </ul>

            <h2>3. Legal Basis for Processing (NDPR Compliance)</h2>
            <p>
              In accordance with the Nigeria Data Protection Regulation (NDPR) issued by the National Information Technology Development Agency (NITDA), we process your personal data on the following lawful bases:
            </p>
            <ul>
              <li><strong>Consent</strong> — when you voluntarily submit an inquiry or contact form.</li>
              <li><strong>Legitimate interests</strong> — for analytics, fraud prevention, and improving our platform, provided these interests do not override your rights.</li>
              <li><strong>Legal obligation</strong> — where processing is required to comply with applicable Nigerian law.</li>
            </ul>

            <h2>4. Data Sharing and Disclosure</h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We may share your data only in the following circumstances:
            </p>
            <ul>
              <li><strong>Service Providers</strong> — trusted third-party vendors who assist us in operating our platform (e.g., cloud hosting, email delivery). These providers are contractually bound to handle your data securely.</li>
              <li><strong>Legal Requirements</strong> — when disclosure is required by law, regulation, or a valid court order in Nigeria.</li>
              <li><strong>Business Transfers</strong> — in the event of a merger, acquisition, or sale of our business assets, your data may be transferred as part of that transaction.</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected:
            </p>
            <ul>
              <li>Inquiry records are retained for up to <strong>24 months</strong> from the date of submission, after which they are securely deleted or anonymised.</li>
              <li>Technical log data is typically retained for <strong>90 days</strong>.</li>
              <li>If you request deletion of your data (see Section 7), we will action this within 30 days.</li>
            </ul>

            <h2>6. Cookies</h2>
            <p>
              Our website uses cookies to enhance your browsing experience. Cookies are small text files stored on your device. We use:
            </p>
            <ul>
              <li><strong>Essential cookies</strong> — required for the website to function (e.g., session management).</li>
              <li><strong>Analytics cookies</strong> — help us understand how visitors interact with our site. Data collected is aggregated and anonymised.</li>
            </ul>
            <p>
              You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.
            </p>

            <h2>7. Your Rights</h2>
            <p>
              Under the NDPR and applicable Nigerian data protection law, you have the following rights regarding your personal data:
            </p>
            <ul>
              <li><strong>Right to Access</strong> — request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification</strong> — request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to Erasure</strong> — request deletion of your personal data, subject to legal retention obligations.</li>
              <li><strong>Right to Object</strong> — object to processing based on legitimate interests, including direct marketing.</li>
              <li><strong>Right to Data Portability</strong> — request your data in a structured, machine-readable format.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:autosales@ecsendia.site" className="text-maroon-700 hover:underline">autosales@ecsendia.site</a>.
              We will respond within 30 days of receiving your request.
            </p>

            <h2>8. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, disclosure, alteration, or destruction. These include encrypted data storage, secure HTTPS connections, and access controls limiting who within our organisation can view inquiry data.
            </p>
            <p>
              While we take data security seriously, no method of transmission over the internet is 100% secure. We encourage you to avoid sharing sensitive financial information via our general contact form.
            </p>

            <h2>9. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies before submitting any personal information.
            </p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed at persons under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected such data, please contact us immediately.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The &quot;Last Updated&quot; date at the top of this page will always reflect the most recent revision. Continued use of our platform after changes are posted constitutes your acceptance of the updated Policy.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
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

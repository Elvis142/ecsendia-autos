import { Metadata } from 'next'
import { ContactForm } from './ContactForm'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Ecsendia Autos. Call, email, or visit us in Lagos, Nigeria. We are here to help you find your next car.',
  openGraph: {
    title: 'Contact Ecsendia Autos',
    description: 'Reach out to our team in Lagos, Nigeria for inquiries about our vehicle inventory.',
  },
}

const businessHours = [
  { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
  { day: 'Saturday',        hours: '9:00 AM – 4:00 PM' },
  { day: 'Sunday',          hours: 'Closed' },
]

const contactDetails = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+234 913 886 3986',
    href: 'tel:+2349138863986',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'autosales@ecsendia.site',
    href: 'mailto:autosales@ecsendia.site',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Lagos, Nigeria',
    href: 'https://maps.google.com/?q=Lagos,Nigeria',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Contact Ecsendia Autos</h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Have a question about a vehicle or need more information? We would love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <ContactForm />
          </div>

          {/* Business Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Get In Touch</h2>
              <ul className="space-y-5">
                {contactDetails.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-maroon-700/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-maroon-700" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-gray-900 font-medium hover:text-maroon-700 transition-colors mt-0.5 block"
                      >
                        {value}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-maroon-700" />
                <h2 className="text-lg font-bold text-gray-900">Business Hours</h2>
              </div>
              <ul className="space-y-3">
                {businessHours.map(({ day, hours }) => (
                  <li key={day} className="flex justify-between text-sm">
                    <span className="text-gray-500">{day}</span>
                    <span className={`font-semibold ${hours === 'Closed' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Note */}
            <div className="bg-maroon-700/5 rounded-2xl p-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                For vehicle-specific inquiries, we recommend using the
                {' '}<span className="font-semibold text-maroon-700">"Get More Information"</span>{' '}
                button on each car listing page for the fastest response.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

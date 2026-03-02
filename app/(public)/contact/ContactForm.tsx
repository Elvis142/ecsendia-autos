'use client'

import { useState, FormEvent } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface FormState {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
}

const initialState: FormState = {
  fullName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message ?? 'Something went wrong. Please try again.')
      }

      setStatus('success')
      setForm(initialState)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err?.message ?? 'Failed to send message.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
        <CheckCircle className="w-12 h-12 text-green-500" />
        <h3 className="text-lg font-bold text-gray-900">Message Sent!</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Thank you for reaching out. We will get back to you as soon as possible, usually within one business day.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-4 text-sm font-medium text-maroon-700 hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fullName" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={form.fullName}
            onChange={handleChange}
            placeholder="e.g. Chidi Okafor"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email Address <span className="text-red-500">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="subject" className={labelClass}>Subject <span className="text-red-500">*</span></label>
          <select
            id="subject"
            name="subject"
            required
            value={form.subject}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Vehicle Inquiry">Vehicle Inquiry</option>
            <option value="Pricing Question">Pricing Question</option>
            <option value="Test Drive Request">Test Drive Request</option>
            <option value="Financing Options">Financing Options</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message <span className="text-red-500">*</span></label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us how we can help you..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-maroon-700 hover:bg-maroon-800 active:bg-maroon-900 disabled:opacity-60 text-white font-bold text-sm tracking-wide transition-colors shadow-sm"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        By submitting this form you agree to our{' '}
        <a href="/privacy" className="underline text-gray-500 hover:text-gray-700">Privacy Policy</a>.
      </p>
    </form>
  )
}

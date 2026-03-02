'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { formatNaira } from '@/lib/formatting'
import { CheckCircle } from 'lucide-react'

const schema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    email: z.string().email('Enter a valid email address'),
    preferredContact: z.enum(['TEXT', 'CALL', 'EMAIL']),
    customerOffer: z.string().optional(),
    shippingNeeded: z.enum(['yes', 'no']),
    shippingCity: z.string().optional(),
    shippingState: z.string().optional(),
    shippingZip: z.string().optional(),
    budgetRange: z.string().optional(),
    paymentPlan: z.enum(['CASH', 'FINANCE', 'NOT_SURE', '']),
    notes: z.string().optional(),
    consent: z.boolean().refine((v) => v === true, 'You must agree to be contacted'),
  })
  .refine(
    (data) => {
      if (data.shippingNeeded === 'yes') {
        return data.shippingCity && data.shippingState
      }
      return true
    },
    {
      message: 'Please enter your shipping destination',
      path: ['shippingCity'],
    }
  )

type FormData = z.infer<typeof schema>

interface InquiryFormProps {
  car: {
    id: string
    title: string
    price: number
    slug: string
  }
  onSuccess?: () => void
}

export function InquiryForm({ car, onSuccess }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      preferredContact: 'CALL',
      shippingNeeded: 'no',
      paymentPlan: 'NOT_SURE',
    },
  })

  const shippingNeeded = watch('shippingNeeded')

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car.id,
          ...data,
          vehiclePrice: car.price,
          customerOffer: data.customerOffer ? parseFloat(data.customerOffer.replace(/[^0-9.]/g, '')) : null,
          shippingNeeded: data.shippingNeeded === 'yes',
          paymentPlan: data.paymentPlan || null,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to submit inquiry')
      }

      setSubmitted(true)
      toast.success('Inquiry submitted! We will contact you soon.')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="flex justify-center">
          <CheckCircle size={56} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
        <p className="text-gray-600 leading-relaxed">
          Your inquiry for <strong>{car.title}</strong> has been received.
          We'll contact you as soon as possible.
        </p>
        <button
          onClick={onSuccess}
          className="text-sm text-maroon-700 underline hover:no-underline"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Car info */}
      <div className="bg-maroon-50 border border-maroon-100 rounded-xl p-4">
        <p className="font-semibold text-maroon-800 text-sm">{car.title}</p>
        <p className="text-2xl font-bold text-maroon-700 mt-0.5">{formatNaira(car.price)}</p>
      </div>

      {/* Contact details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          id="fullName"
          placeholder="e.g. Chukwuemeka Eze"
          required
          {...register('fullName')}
          error={errors.fullName?.message}
        />
        <Input
          label="Phone Number"
          id="phone"
          type="tel"
          placeholder="+234 801 234 5678"
          required
          {...register('phone')}
          error={errors.phone?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          required
          {...register('email')}
          error={errors.email?.message}
        />
        <Select
          label="Preferred Contact Method"
          id="preferredContact"
          required
          options={[
            { value: 'CALL', label: 'Phone Call' },
            { value: 'TEXT', label: 'Text/WhatsApp' },
            { value: 'EMAIL', label: 'Email' },
          ]}
          {...register('preferredContact')}
          error={errors.preferredContact?.message}
        />
      </div>

      {/* Vehicle price (auto-filled) */}
      <Input
        label="Vehicle Price"
        id="vehiclePrice"
        value={formatNaira(car.price)}
        readOnly
        className="bg-gray-50"
      />

      {/* Customer offer */}
      <Input
        label="Your Offer (optional)"
        id="customerOffer"
        type="text"
        placeholder="e.g. ₦8,500,000"
        {...register('customerOffer')}
        helperText="Leave blank to accept the listed price"
      />

      {/* Shipping */}
      <Select
        label="Shipping Needed?"
        id="shippingNeeded"
        required
        options={[
          { value: 'no', label: 'No, I will pick up' },
          { value: 'yes', label: 'Yes, I need shipping' },
        ]}
        {...register('shippingNeeded')}
      />

      {shippingNeeded === 'yes' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Input
            label="City"
            id="shippingCity"
            placeholder="Lagos"
            required
            {...register('shippingCity')}
            error={errors.shippingCity?.message}
          />
          <Input
            label="State"
            id="shippingState"
            placeholder="Lagos State"
            required
            {...register('shippingState')}
            error={errors.shippingState?.message}
          />
          <Input
            label="ZIP / Postal Code"
            id="shippingZip"
            placeholder="100001"
            {...register('shippingZip')}
          />
        </div>
      )}

      {/* Payment plan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Payment Method"
          id="paymentPlan"
          options={[
            { value: 'CASH', label: 'Full Cash Payment' },
            { value: 'FINANCE', label: 'Financing / Installments' },
            { value: 'NOT_SURE', label: 'Not Sure Yet' },
          ]}
          {...register('paymentPlan')}
        />
        <Input
          label="Budget Range (optional)"
          id="budgetRange"
          placeholder="e.g. ₦8M - ₦10M"
          {...register('budgetRange')}
        />
      </div>

      {/* Notes */}
      <Textarea
        label="Additional Notes (optional)"
        id="notes"
        placeholder="Any specific questions, requests, or comments about this vehicle..."
        {...register('notes')}
      />

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-maroon-700 focus:ring-maroon-500"
          {...register('consent')}
        />
        <span className="text-sm text-gray-600">
          I agree to be contacted by Ecsendia Autos regarding this vehicle inquiry. *
        </span>
      </label>
      {errors.consent && <p className="text-xs text-red-600 -mt-2">{errors.consent.message}</p>}

      <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
        Submit Inquiry
      </Button>
    </form>
  )
}

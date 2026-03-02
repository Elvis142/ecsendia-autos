'use client'
import { Modal } from '@/components/ui/modal'
import { InquiryForm } from '@/components/forms/InquiryForm'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  car: {
    id: string
    title: string
    price: number
    slug: string
  } | null
}

export function InquiryModal({ isOpen, onClose, car }: InquiryModalProps) {
  if (!car) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Get More Information" size="lg">
      <InquiryForm car={car} onSuccess={onClose} />
    </Modal>
  )
}

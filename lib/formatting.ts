export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatMileage(miles: number): string {
  return new Intl.NumberFormat('en-US').format(miles) + ' mi'
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getTransmissionLabel(transmission: string): string {
  const map: Record<string, string> = {
    AUTOMATIC: 'Automatic',
    MANUAL: 'Manual',
    CVT: 'CVT',
    SEMI_AUTOMATIC: 'Semi-Auto',
  }
  return map[transmission] || transmission
}

export function getDriveLabel(drive: string): string {
  const map: Record<string, string> = {
    FWD: 'FWD',
    RWD: 'RWD',
    AWD: 'AWD',
    FOUR_WD: '4WD',
  }
  return map[drive] || drive
}

export function getFuelLabel(fuel: string): string {
  const map: Record<string, string> = {
    GAS: 'Gasoline',
    DIESEL: 'Diesel',
    HYBRID: 'Hybrid',
    ELECTRIC: 'Electric',
    PLUG_IN_HYBRID: 'Plug-in Hybrid',
  }
  return map[fuel] || fuel
}

export function getBodyLabel(body: string): string {
  const map: Record<string, string> = {
    SEDAN: 'Sedan',
    SUV: 'SUV',
    TRUCK: 'Truck',
    COUPE: 'Coupe',
    HATCHBACK: 'Hatchback',
    CONVERTIBLE: 'Convertible',
    WAGON: 'Wagon',
    MINIVAN: 'Minivan',
    VAN: 'Van',
  }
  return map[body] || body
}

export function getConditionLabel(condition: string): string {
  const map: Record<string, string> = {
    CLEAN_TITLE: 'Clean Title',
    REBUILT_TITLE: 'Rebuilt Title',
    SALVAGE: 'Salvage',
    LEMON_LAW: 'Lemon Law',
  }
  return map[condition] || condition
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SOLD: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

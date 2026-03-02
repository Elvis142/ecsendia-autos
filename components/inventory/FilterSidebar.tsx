'use client'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const makes = ['Toyota', 'Honda', 'Lexus', 'Mercedes-Benz', 'BMW', 'Audi', 'Hyundai', 'Kia', 'Nissan', 'Ford', 'Chevrolet', 'Jeep', 'Volkswagen', 'Mazda', 'Subaru']
const bodyTypes = ['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'HATCHBACK', 'CONVERTIBLE', 'WAGON', 'MINIVAN']
const transmissions = ['AUTOMATIC', 'MANUAL', 'CVT']
const fuelTypes = ['GAS', 'DIESEL', 'HYBRID', 'ELECTRIC']
const driveTypes = ['FWD', 'RWD', 'AWD', 'FOUR_WD']
const conditions = ['CLEAN_TITLE', 'REBUILT_TITLE', 'SALVAGE']
const statuses = ['AVAILABLE', 'PENDING', 'SOLD']

const bodyTypeLabels: Record<string, string> = {
  SEDAN: 'Sedan', SUV: 'SUV', TRUCK: 'Truck', COUPE: 'Coupe',
  HATCHBACK: 'Hatchback', CONVERTIBLE: 'Convertible', WAGON: 'Wagon', MINIVAN: 'Minivan',
}
const conditionLabels: Record<string, string> = {
  CLEAN_TITLE: 'Clean Title', REBUILT_TITLE: 'Rebuilt', SALVAGE: 'Salvage',
}
const driveLabels: Record<string, string> = {
  FWD: 'FWD', RWD: 'RWD', AWD: 'AWD', FOUR_WD: '4WD',
}

interface FilterSidebarProps {
  searchParams: Record<string, string>
  onParamChange: (key: string, value: string | null) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export function FilterSidebar({ searchParams, onParamChange, mobileOpen, onMobileClose }: FilterSidebarProps) {
  const hasFilters = Object.keys(searchParams).some(
    (k) => !['page', 'sort'].includes(k) && searchParams[k]
  )

  const SidebarContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={() => {
              const params = ['make', 'bodyType', 'transmission', 'fuelType', 'driveType', 'condition', 'status', 'minPrice', 'maxPrice', 'minYear', 'maxYear', 'maxMileage']
              params.forEach((p) => onParamChange(p, null))
            }}
            className="text-xs text-maroon-700 hover:text-maroon-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Make */}
      <FilterSection title="Make">
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-hide">
          {makes.map((make) => (
            <label key={make} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="make"
                value={make}
                checked={searchParams.make === make}
                onChange={(e) => onParamChange('make', e.target.checked ? make : null)}
                className="text-maroon-700 focus:ring-maroon-500"
              />
              <span className="text-sm text-gray-700">{make}</span>
            </label>
          ))}
        </div>
        {searchParams.make && (
          <button onClick={() => onParamChange('make', null)} className="text-xs text-maroon-700 mt-1">
            Clear
          </button>
        )}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range (₦)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={searchParams.minPrice || ''}
            onChange={(e) => onParamChange('minPrice', e.target.value || null)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 w-full"
          />
          <input
            type="number"
            placeholder="Max"
            value={searchParams.maxPrice || ''}
            onChange={(e) => onParamChange('maxPrice', e.target.value || null)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 w-full"
          />
        </div>
      </FilterSection>

      {/* Year Range */}
      <FilterSection title="Year Range">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="From"
            min={1990}
            max={2025}
            value={searchParams.minYear || ''}
            onChange={(e) => onParamChange('minYear', e.target.value || null)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 w-full"
          />
          <input
            type="number"
            placeholder="To"
            min={1990}
            max={2025}
            value={searchParams.maxYear || ''}
            onChange={(e) => onParamChange('maxYear', e.target.value || null)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 w-full"
          />
        </div>
      </FilterSection>

      {/* Max Mileage */}
      <FilterSection title="Max Mileage">
        <input
          type="number"
          placeholder="e.g. 100000"
          value={searchParams.maxMileage || ''}
          onChange={(e) => onParamChange('maxMileage', e.target.value || null)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 w-full"
        />
      </FilterSection>

      {/* Body Type */}
      <FilterSection title="Body Type">
        <div className="grid grid-cols-2 gap-1.5">
          {bodyTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchParams.bodyType === type}
                onChange={(e) => onParamChange('bodyType', e.target.checked ? type : null)}
                className="rounded text-maroon-700 focus:ring-maroon-500"
              />
              <span className="text-sm text-gray-700">{bodyTypeLabels[type] || type}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Transmission */}
      <FilterSection title="Transmission">
        {transmissions.map((t) => (
          <label key={t} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.transmission === t}
              onChange={(e) => onParamChange('transmission', e.target.checked ? t : null)}
              className="rounded text-maroon-700 focus:ring-maroon-500"
            />
            <span className="text-sm text-gray-700 capitalize">{t.toLowerCase()}</span>
          </label>
        ))}
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="Fuel Type">
        {fuelTypes.map((f) => (
          <label key={f} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.fuelType === f}
              onChange={(e) => onParamChange('fuelType', e.target.checked ? f : null)}
              className="rounded text-maroon-700 focus:ring-maroon-500"
            />
            <span className="text-sm text-gray-700 capitalize">{f.toLowerCase()}</span>
          </label>
        ))}
      </FilterSection>

      {/* Drive Type */}
      <FilterSection title="Drive Type">
        <div className="grid grid-cols-2 gap-1.5">
          {driveTypes.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={searchParams.driveType === d}
                onChange={(e) => onParamChange('driveType', e.target.checked ? d : null)}
                className="rounded text-maroon-700 focus:ring-maroon-500"
              />
              <span className="text-sm text-gray-700">{driveLabels[d] || d}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Title Status">
        {conditions.map((c) => (
          <label key={c} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.condition === c}
              onChange={(e) => onParamChange('condition', e.target.checked ? c : null)}
              className="rounded text-maroon-700 focus:ring-maroon-500"
            />
            <span className="text-sm text-gray-700">{conditionLabels[c] || c}</span>
          </label>
        ))}
      </FilterSection>

      {/* Status */}
      <FilterSection title="Availability">
        {statuses.map((s) => (
          <label key={s} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={searchParams.status === s}
              onChange={(e) => onParamChange('status', e.target.checked ? s : null)}
              className="rounded text-maroon-700 focus:ring-maroon-500"
            />
            <span className="text-sm text-gray-700 capitalize">{s.toLowerCase()}</span>
          </label>
        ))}
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button
                onClick={onMobileClose}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <SidebarContent />
            </div>
          </div>
        </>
      )}
    </>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

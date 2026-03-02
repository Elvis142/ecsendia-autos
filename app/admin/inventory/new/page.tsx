'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Upload, X, ChevronLeft, Plus, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const carSchema = z.object({
  year: z.coerce.number().int().min(1990).max(2030),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  trim: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(1, 'Price is required'),
  mileage: z.coerce.number().int().min(0).optional().or(z.literal('')),
  vin: z.string().optional().or(z.literal('')),
  exteriorColor: z.string().optional().or(z.literal('')),
  interiorColor: z.string().optional().or(z.literal('')),
  engine: z.string().optional().or(z.literal('')),
  transmission: z.enum(['AUTOMATIC', 'MANUAL', 'CVT', 'SEMI_AUTOMATIC']).optional().or(z.literal('')),
  driveType: z.enum(['FWD', 'RWD', 'AWD', 'FOUR_WD']).optional().or(z.literal('')),
  fuelType: z.enum(['GAS', 'DIESEL', 'HYBRID', 'ELECTRIC', 'PLUG_IN_HYBRID']).optional().or(z.literal('')),
  bodyType: z.enum(['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'HATCHBACK', 'CONVERTIBLE', 'WAGON', 'MINIVAN', 'VAN']).optional().or(z.literal('')),
  condition: z.enum(['CLEAN_TITLE', 'REBUILT_TITLE', 'SALVAGE', 'LEMON_LAW']).optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['AVAILABLE', 'PENDING', 'SOLD']).default('AVAILABLE'),
  visibility: z.enum(['PUBLISHED', 'DRAFT']).default('DRAFT'),
  featured: z.boolean().default(false),
  sourceUrl: z.string().optional().or(z.literal('')),
});

type CarFormData = z.infer<typeof carSchema>;

interface UploadedPhoto {
  url: string;
  key: string;
  isMain: boolean;
}

const FormField = ({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 transition bg-white';

const selectClass = cn(inputClass, 'cursor-pointer');

export default function AddCarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema) as any,
    defaultValues: {
      status: 'AVAILABLE',
      visibility: 'DRAFT',
      featured: false,
    },
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        const data = await res.json();
        setPhotos((prev) => [
          ...prev,
          { url: data.url, key: data.key, isMain: prev.length === 0 },
        ]);
      }
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    uploadFiles(files);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (prev[index].isMain && next.length > 0) {
        next[0] = { ...next[0], isMain: true };
      }
      return next;
    });
  };

  const setMainPhoto = (index: number) => {
    setPhotos((prev) =>
      prev.map((p, i) => ({ ...p, isMain: i === index }))
    );
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures((prev) => prev.filter((f) => f !== feature));
  };

  const onSubmit: SubmitHandler<CarFormData> = async (data) => {
    if (photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        features,
        photos: photos.map((p, i) => ({ url: p.url, key: p.key, isMain: p.isMain, order: i })),
        title: `${data.year} ${data.make} ${data.model}${data.trim ? ' ' + data.trim : ''}`,
      };
      const res = await fetch('/api/admin/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create car');
      }
      const car = await res.json();
      toast.success('Car created successfully');
      router.push(`/admin/inventory/${car.id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create car');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Car</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormField label="Year" required error={errors.year?.message}>
              <input
                {...register('year')}
                type="number"
                placeholder={String(new Date().getFullYear())}
                className={inputClass}
              />
            </FormField>
            <FormField label="Make" required error={errors.make?.message}>
              <input {...register('make')} type="text" placeholder="e.g. Toyota" className={inputClass} />
            </FormField>
            <FormField label="Model" required error={errors.model?.message}>
              <input {...register('model')} type="text" placeholder="e.g. Camry" className={inputClass} />
            </FormField>
            <FormField label="Trim" error={errors.trim?.message}>
              <input {...register('trim')} type="text" placeholder="e.g. LE, XLE" className={inputClass} />
            </FormField>
            <FormField label="Price (₦)" required error={errors.price?.message}>
              <input
                {...register('price')}
                type="number"
                placeholder="0"
                className={inputClass}
              />
            </FormField>
            <FormField label="Mileage (km)" error={errors.mileage?.message}>
              <input
                {...register('mileage')}
                type="number"
                placeholder="0"
                className={inputClass}
              />
            </FormField>
            <FormField label="VIN" error={errors.vin?.message}>
              <input {...register('vin')} type="text" placeholder="Vehicle ID Number" className={inputClass} />
            </FormField>
            <FormField label="Exterior Color" error={errors.exteriorColor?.message}>
              <input
                {...register('exteriorColor')}
                type="text"
                placeholder="e.g. Pearl White"
                className={inputClass}
              />
            </FormField>
            <FormField label="Interior Color" error={errors.interiorColor?.message}>
              <input
                {...register('interiorColor')}
                type="text"
                placeholder="e.g. Black Leather"
                className={inputClass}
              />
            </FormField>
          </div>
        </section>

        {/* Vehicle Specs */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Vehicle Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormField label="Engine" error={errors.engine?.message}>
              <input
                {...register('engine')}
                type="text"
                placeholder="e.g. 2.5L 4-Cylinder"
                className={inputClass}
              />
            </FormField>
            <FormField label="Transmission" error={errors.transmission?.message}>
              <select {...register('transmission')} className={selectClass}>
                <option value="">Select transmission</option>
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
                <option value="CVT">CVT</option>
                <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
              </select>
            </FormField>
            <FormField label="Drive Type" error={errors.driveType?.message}>
              <select {...register('driveType')} className={selectClass}>
                <option value="">Select drive type</option>
                <option value="FWD">FWD</option>
                <option value="RWD">RWD</option>
                <option value="AWD">AWD</option>
                <option value="FOUR_WD">4WD / 4x4</option>
              </select>
            </FormField>
            <FormField label="Fuel Type" error={errors.fuelType?.message}>
              <select {...register('fuelType')} className={selectClass}>
                <option value="">Select fuel type</option>
                <option value="GAS">Gasoline</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
                <option value="PLUG_IN_HYBRID">Plug-In Hybrid</option>
              </select>
            </FormField>
            <FormField label="Body Type" error={errors.bodyType?.message}>
              <select {...register('bodyType')} className={selectClass}>
                <option value="">Select body type</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="TRUCK">Truck</option>
                <option value="COUPE">Coupe</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="CONVERTIBLE">Convertible</option>
                <option value="WAGON">Wagon</option>
                <option value="MINIVAN">Minivan</option>
                <option value="VAN">Van</option>
              </select>
            </FormField>
            <FormField label="Condition" error={errors.condition?.message}>
              <select {...register('condition')} className={selectClass}>
                <option value="">Select condition</option>
                <option value="CLEAN_TITLE">Clean Title</option>
                <option value="REBUILT_TITLE">Rebuilt Title</option>
                <option value="SALVAGE">Salvage</option>
                <option value="LEMON_LAW">Lemon Law</option>
              </select>
            </FormField>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="City" error={errors.city?.message}>
              <input {...register('city')} type="text" placeholder="e.g. Lagos" className={inputClass} />
            </FormField>
            <FormField label="State" error={errors.state?.message}>
              <input {...register('state')} type="text" placeholder="e.g. Lagos State" className={inputClass} />
            </FormField>
          </div>
        </section>

        {/* Description & Features */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Description & Features
          </h2>
          <FormField label="Description" error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Describe the car in detail..."
              className={cn(inputClass, 'resize-y min-h-[120px]')}
            />
          </FormField>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Features</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Type a feature and press Enter"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-3 py-2.5 bg-maroon-700/10 text-maroon-700 rounded-lg hover:bg-maroon-700/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-maroon-700/10 text-maroon-700 text-sm rounded-full"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => removeFeature(f)}
                      className="text-maroon-700/60 hover:text-maroon-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Listing Settings */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Listing Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Status" error={errors.status?.message}>
              <select {...register('status')} className={selectClass}>
                <option value="AVAILABLE">Available</option>
                <option value="PENDING">Pending</option>
                <option value="SOLD">Sold</option>
              </select>
            </FormField>
            <FormField label="Visibility" error={errors.visibility?.message}>
              <select {...register('visibility')} className={selectClass}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </FormField>
            <FormField label="Source URL" error={errors.sourceUrl?.message}>
              <input
                {...register('sourceUrl')}
                type="url"
                placeholder="https://facebook.com/marketplace/..."
                className={inputClass}
              />
            </FormField>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input {...register('featured')} type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-maroon-700 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-gray-700">Featured Listing</span>
          </label>
        </section>

        {/* Photo Upload */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Photos
          </h2>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingOver(true);
            }}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200',
              draggingOver
                ? 'border-maroon-700 bg-maroon-700/5'
                : 'border-gray-300 hover:border-maroon-700/50 hover:bg-gray-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-maroon-700 animate-spin" />
                <p className="text-sm text-gray-500">Uploading photos...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">
                    Drag & drop photos here
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    or click to browse — JPG, PNG, WebP
                  </p>
                </div>
              </div>
            )}
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {photos.map((photo, index) => (
                <div
                  key={photo.key}
                  className={cn(
                    'relative group rounded-lg overflow-hidden border-2 aspect-[4/3]',
                    photo.isMain ? 'border-maroon-700' : 'border-transparent'
                  )}
                >
                  <Image
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                    {!photo.isMain && (
                      <button
                        type="button"
                        onClick={() => setMainPhoto(index)}
                        className="px-2 py-1 bg-maroon-700 text-white text-xs rounded font-medium"
                      >
                        Set Main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="p-1 bg-red-600 text-white rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {photo.isMain && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-maroon-700 text-white text-xs rounded font-medium">
                      Main
                    </div>
                  )}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-maroon-700/50 hover:text-maroon-700 transition-colors"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs">Add more</span>
              </button>
            </div>
          )}
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-maroon-700 rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Creating...' : 'Create Car'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Plus,
  X,
  Upload,
  ImageIcon,
  Loader2,
  ExternalLink,
  Bot,
  ChevronUp,
  ChevronDown,
  Star,
  AlertCircle,
} from 'lucide-react';
import { formatNaira } from '@/lib/formatting';
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

interface PhotoRecord {
  id: string;
  url: string;
  key: string;
  isMain: boolean;
  order: number;
}

interface CarData {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage?: number;
  vin?: string;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  bodyType?: string;
  condition?: string;
  city?: string;
  state?: string;
  description?: string;
  status: string;
  visibility: string;
  featured: boolean;
  sourceUrl?: string;
  features: string[];
  aiImported: boolean;
  photos: PhotoRecord[];
  slug: string;
}

const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-700/30 focus:border-maroon-700 transition bg-white';

const selectClass = cn(inputClass, 'cursor-pointer');

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

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [car, setCar] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema) as any,
  });

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await fetch(`/api/admin/cars/${id}`);
        if (!res.ok) throw new Error('Car not found');
        const data: CarData = await res.json();
        setCar(data);
        setPhotos(data.photos.sort((a, b) => a.order - b.order));
        setFeatures(data.features || []);
        reset({
          year: data.year,
          make: data.make,
          model: data.model,
          trim: data.trim || '',
          price: data.price,
          mileage: data.mileage,
          vin: data.vin || '',
          exteriorColor: data.exteriorColor || '',
          interiorColor: data.interiorColor || '',
          engine: data.engine || '',
          transmission: (data.transmission as CarFormData['transmission']) || undefined,
          driveType: (data.driveType as CarFormData['driveType']) || undefined,
          fuelType: (data.fuelType as CarFormData['fuelType']) || undefined,
          bodyType: (data.bodyType as CarFormData['bodyType']) || undefined,
          condition: (data.condition as CarFormData['condition']) || undefined,
          city: data.city || '',
          state: data.state || '',
          description: data.description || '',
          status: data.status as CarFormData['status'],
          visibility: data.visibility as CarFormData['visibility'],
          featured: data.featured,
          sourceUrl: data.sourceUrl || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load car');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCar();
  }, [id, reset]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploading(true);
      try {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('carId', id);
          const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
          if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
          const data = await res.json();
          setPhotos((prev) => [
            ...prev,
            {
              id: data.id || Date.now().toString(),
              url: data.url,
              key: data.key,
              isMain: prev.length === 0,
              order: prev.length,
            },
          ]);
        }
        toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [id]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    uploadFiles(files);
  };

  const handleDeletePhoto = async (photo: PhotoRecord) => {
    setDeletingPhoto(photo.id);
    try {
      const res = await fetch(`/api/admin/cars/${id}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setPhotos((prev) => {
        const next = prev.filter((p) => p.id !== photo.id);
        if (photo.isMain && next.length > 0) {
          next[0] = { ...next[0], isMain: true };
        }
        return next;
      });
      toast.success('Photo removed');
    } catch {
      toast.error('Failed to delete photo');
    } finally {
      setDeletingPhoto(null);
    }
  };

  const handleSetMainPhoto = async (photo: PhotoRecord) => {
    try {
      const res = await fetch(`/api/admin/cars/${id}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id, isMain: true }),
      });
      if (!res.ok) throw new Error('Failed to set main photo');
      setPhotos((prev) => prev.map((p) => ({ ...p, isMain: p.id === photo.id })));
      toast.success('Main photo updated');
    } catch {
      toast.error('Failed to update main photo');
    }
  };

  const movePhoto = async (index: number, direction: 'up' | 'down') => {
    const newPhotos = [...photos];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newPhotos.length) return;
    [newPhotos[index], newPhotos[swapIndex]] = [newPhotos[swapIndex], newPhotos[index]];
    const reordered = newPhotos.map((p, i) => ({ ...p, order: i }));
    setPhotos(reordered);
    try {
      await fetch(`/api/admin/cars/${id}/photos/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: reordered.map((p) => ({ id: p.id, order: p.order })),
        }),
      });
    } catch {
      toast.error('Failed to save photo order');
    }
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((prev) => [...prev, trimmed]);
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) =>
    setFeatures((prev) => prev.filter((f) => f !== feature));

  const onSubmit: SubmitHandler<CarFormData> = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        features,
        title: `${data.year} ${data.make} ${data.model}${data.trim ? ' ' + data.trim : ''}`,
      };
      const res = await fetch(`/api/admin/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }
      toast.success('Car updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update car');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">{error || 'Car not found'}</p>
          <button
            onClick={() => router.push('/admin/inventory')}
            className="mt-4 px-4 py-2 bg-maroon-700 text-white rounded-lg text-sm"
          >
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/inventory')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{car.title}</h1>
              {car.aiImported && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                  <Bot className="w-3 h-3" />
                  AI Imported
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatNaira(car.price)} &middot; {car.status}
            </p>
          </div>
        </div>
        {car.visibility === 'PUBLISHED' && (
          <Link
            href={`/inventory/${car.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-maroon-700 hover:underline"
          >
            View public listing <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormField label="Year" required error={errors.year?.message}>
              <input {...register('year')} type="number" className={inputClass} />
            </FormField>
            <FormField label="Make" required error={errors.make?.message}>
              <input {...register('make')} type="text" className={inputClass} />
            </FormField>
            <FormField label="Model" required error={errors.model?.message}>
              <input {...register('model')} type="text" className={inputClass} />
            </FormField>
            <FormField label="Trim" error={errors.trim?.message}>
              <input {...register('trim')} type="text" className={inputClass} />
            </FormField>
            <FormField label="Price (₦)" required error={errors.price?.message}>
              <input {...register('price')} type="number" className={inputClass} />
            </FormField>
            <FormField label="Mileage (km)" error={errors.mileage?.message}>
              <input {...register('mileage')} type="number" className={inputClass} />
            </FormField>
            <FormField label="VIN" error={errors.vin?.message}>
              <input {...register('vin')} type="text" className={inputClass} />
            </FormField>
            <FormField label="Exterior Color" error={errors.exteriorColor?.message}>
              <input {...register('exteriorColor')} type="text" className={inputClass} />
            </FormField>
            <FormField label="Interior Color" error={errors.interiorColor?.message}>
              <input {...register('interiorColor')} type="text" className={inputClass} />
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
              <input {...register('engine')} type="text" className={inputClass} />
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
              <input {...register('city')} type="text" className={inputClass} />
            </FormField>
            <FormField label="State" error={errors.state?.message}>
              <input {...register('state')} type="text" className={inputClass} />
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
                      className="text-maroon-700/60 hover:text-maroon-700"
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
              <input {...register('sourceUrl')} type="url" className={inputClass} />
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

        {/* Photos */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Photos ({photos.length})
          </h2>

          {photos.length > 0 && (
            <div className="space-y-2">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={cn(
                    'flex items-center gap-3 p-3 border rounded-xl',
                    photo.isMain
                      ? 'border-maroon-700 bg-maroon-700/5'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => movePhoto(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(index, 'down')}
                      disabled={index === photos.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-700 font-medium">Photo {index + 1}</span>
                      {photo.isMain && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-maroon-700 text-white text-xs rounded-full">
                          <Star className="w-3 h-3" fill="currentColor" /> Main
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{photo.url}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!photo.isMain && (
                      <button
                        type="button"
                        onClick={() => handleSetMainPhoto(photo)}
                        className="px-2.5 py-1 text-xs font-medium bg-maroon-700/10 text-maroon-700 rounded-lg hover:bg-maroon-700/20 transition-colors"
                      >
                        Set Main
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={deletingPhoto === photo.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingPhoto === photo.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingOver(true);
            }}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
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
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-maroon-700 animate-spin" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drop photos here or <span className="text-maroon-700 font-medium">browse</span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pb-8">
          <button
            type="button"
            onClick={() => router.push('/admin/inventory')}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Inventory
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-maroon-700 rounded-lg hover:bg-maroon-800 transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Host listing create/edit form — RHF + Zod; dollars in UI → cents on submit.
 * Preserves / resolves lat/lng so map preview keeps working after edits.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { queryKeys } from "@/constants/query-keys";
import { getAmenities, getCategories } from "@/services/catalog";
import type { ListingWritePayload } from "@/types/host";
import type { ListingDetail } from "@/types/listing-detail";
import type { PropertyType } from "@/types/listing";
import { resolveListingCoords } from "@/utils/geocode";

const propertyTypes: PropertyType[] = [
  "house",
  "apartment",
  "guesthouse",
  "hotel",
  "villa",
  "cabin",
];

const formSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  category_id: z.number().int().positive(),
  property_type: z.enum(["house", "apartment", "guesthouse", "hotel", "villa", "cabin"]),
  price_per_night_dollars: z.number().positive(),
  cleaning_fee_dollars: z.number().min(0),
  service_fee_percent: z.number().min(0).max(30),
  country: z.string().min(2),
  city: z.string().min(1),
  state: z.string().optional(),
  address: z.string().min(3),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  max_guests: z.number().int().min(1).max(50),
  bedrooms: z.number().int().min(0).max(50),
  beds: z.number().int().min(1).max(50),
  bathrooms: z.number().int().min(1).max(50),
  amenity_ids: z.array(z.number()),
  images: z
    .array(z.object({ url: z.string().url() }))
    .min(1, "Add at least one image URL"),
});

type FormValues = z.infer<typeof formSchema>;

function toPayload(values: FormValues): ListingWritePayload {
  const coords = resolveListingCoords(values.city, values.lat ?? null, values.lng ?? null);
  return {
    title: values.title,
    description: values.description,
    category_id: values.category_id,
    property_type: values.property_type,
    price_per_night: Math.round(values.price_per_night_dollars * 100),
    cleaning_fee: Math.round(values.cleaning_fee_dollars * 100),
    service_fee_percent: values.service_fee_percent,
    country: values.country,
    city: values.city,
    state: values.state?.trim() ? values.state.trim() : null,
    address: values.address,
    lat: coords.lat,
    lng: coords.lng,
    max_guests: values.max_guests,
    bedrooms: values.bedrooms,
    beds: values.beds,
    bathrooms: values.bathrooms,
    amenity_ids: values.amenity_ids,
    images: values.images.map((img) => ({ url: img.url })),
  };
}

function fromListing(listing: ListingDetail): FormValues {
  return {
    title: listing.title,
    description: listing.description,
    category_id: listing.category.id,
    property_type: listing.property_type,
    price_per_night_dollars: listing.price_per_night / 100,
    cleaning_fee_dollars: listing.cleaning_fee / 100,
    service_fee_percent: listing.service_fee_percent,
    country: listing.country,
    city: listing.city,
    state: listing.state ?? "",
    address: listing.address,
    lat: listing.lat,
    lng: listing.lng,
    max_guests: listing.max_guests,
    bedrooms: listing.bedrooms,
    beds: listing.beds,
    bathrooms: listing.bathrooms,
    amenity_ids: listing.amenities.map((a) => a.id),
    images: listing.images.map((img) => ({ url: img.url })),
  };
}

const defaults: FormValues = {
  title: "",
  description: "",
  category_id: 1,
  property_type: "apartment",
  price_per_night_dollars: 100,
  cleaning_fee_dollars: 50,
  service_fee_percent: 12,
  country: "United States",
  city: "",
  state: "",
  address: "",
  lat: null,
  lng: null,
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenity_ids: [],
  images: [{ url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200" }],
};

interface ListingFormProps {
  initial?: ListingDetail;
  submitting?: boolean;
  onSubmit: (payload: ListingWritePayload) => void;
}

export function ListingForm({ initial, submitting, onSubmit }: ListingFormProps) {
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
  const { data: amenities = [] } = useQuery({
    queryKey: queryKeys.amenities,
    queryFn: getAmenities,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial ? fromListing(initial) : defaults,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "images" });
  const selectedAmenities = watch("amenity_ids") ?? [];

  const toggleAmenity = (id: number) => {
    const next = selectedAmenities.includes(id)
      ? selectedAmenities.filter((x) => x !== id)
      : [...selectedAmenities, id];
    setValue("amenity_ids", next, { shouldDirty: true });
  };

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(toPayload(values)))}
      className="space-y-8"
    >
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-abnb-fg">Basics</h2>
        <label className="block text-sm">
          <span className="font-medium">Title</span>
          <input {...register("title")} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </label>
        <label className="block text-sm">
          <span className="font-medium">Description</span>
          <textarea {...register("description")} rows={4} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
          )}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Category</span>
            <select {...register("category_id", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Property type</span>
            <select {...register("property_type")} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2">
              {propertyTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-abnb-fg">Pricing (USD)</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="font-medium">Nightly price</span>
            <input type="number" step="1" {...register("price_per_night_dollars", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Cleaning fee</span>
            <input type="number" step="1" {...register("cleaning_fee_dollars", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Service fee %</span>
            <input type="number" {...register("service_fee_percent", { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-abnb-fg">Location</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Country</span>
            <input {...register("country")} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">City</span>
            <input {...register("city")} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">State / region</span>
            <input {...register("state")} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Address</span>
            <input {...register("address")} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Latitude (optional)</span>
            <input
              type="number"
              step="any"
              {...register("lat", {
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
              })}
              className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Longitude (optional)</span>
            <input
              type="number"
              step="any"
              {...register("lng", {
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
              })}
              className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2"
            />
          </label>
        </div>
        <p className="text-xs text-abnb-muted">
          Leave lat/lng blank to auto-fill from known cities (Bali, Tokyo, London, …). Existing
          coordinates are kept when you edit.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-abnb-fg">Capacity</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(["max_guests", "bedrooms", "beds", "bathrooms"] as const).map((field) => (
            <label key={field} className="block text-sm">
              <span className="font-medium capitalize">{field.replace("_", " ")}</span>
              <input type="number" {...register(field, { valueAsNumber: true })} className="mt-1 w-full rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2" />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-abnb-fg">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => {
            const on = selectedAmenities.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                className={`rounded-pill border px-3 py-1.5 text-sm ${
                  on
                    ? "border-abnb-fg bg-abnb-fg text-abnb-surface"
                    : "border-abnb-border text-abnb-fg hover:border-abnb-fg"
                }`}
              >
                {a.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-abnb-fg">Photos (URLs)</h2>
          <button
            type="button"
            onClick={() => append({ url: "" })}
            className="text-sm font-semibold text-coral hover:underline"
          >
            Add photo
          </button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <input
              {...register(`images.${index}.url`)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 rounded-lg border border-abnb-border bg-abnb-surface px-3 py-2 text-sm"
            />
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)} className="text-sm text-red-600">
                Remove
              </button>
            )}
          </div>
        ))}
        {errors.images && (
          <p className="text-xs text-red-600">
            {typeof errors.images.message === "string"
              ? errors.images.message
              : "Add at least one valid image URL"}
          </p>
        )}
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-hover disabled:opacity-50"
      >
        {submitting ? "Saving…" : initial ? "Save changes" : "Publish listing"}
      </button>
    </form>
  );
}

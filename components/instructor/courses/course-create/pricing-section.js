"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PricingSection({ register, errors }) {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Label htmlFor="priceCents" className="mb-2">Giá (VNĐ)</Label>
        <Input id="priceCents" type="number" min="0" {...register("priceCents")} />
        {errors.priceCents && <p className="text-red-500 text-sm mt-1">{errors.priceCents.message}</p>}
      </div>
      <div className="w-32">
        <Label htmlFor="currency" className="mb-2">Tiền tệ</Label>
        <Input id="currency" {...register("currency")} />
        {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>}
      </div>
    </div>
  )
}

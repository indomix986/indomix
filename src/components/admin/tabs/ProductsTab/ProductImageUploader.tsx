import {
  AdminImageUploader,
  type AdminImageUploaderProps,
} from "@/components/admin/AdminImageUploader";

export interface ProductImageUploaderProps extends Omit<
  AdminImageUploaderProps,
  "entityType" | "entityId"
> {
  productId?: string;
}

export function ProductImageUploader({ productId, ...props }: ProductImageUploaderProps) {
  return (
    <AdminImageUploader
      entityType="products"
      entityId={productId}
      label="صورة الوجبة *"
      {...props}
    />
  );
}

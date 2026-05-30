import { SupplierDetailPage } from "@/features/supplier"

interface SupplierDetailRouteProps {
  params: Promise<{ id: string }>
}

/**
 * Supplier detail route — shows full supplier profile with VVS history.
 */
export default async function SupplierDetailRoute({ params }: SupplierDetailRouteProps) {
  const { id } = await params
  return <SupplierDetailPage supplierId={id} />
}

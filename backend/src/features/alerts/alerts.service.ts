import { prisma } from "@/config/database.js"
import { NotFoundError } from "@/lib/errors.js"
import { emitToOrganization } from "@/core/realtime/websocket.js"
import type { AlertType, AlertSeverity } from "@prisma/client"

/**
 * Creates a new alert and emits it via WebSocket.
 */
export async function createAlert(data: {
  supplierId: string
  alertType: AlertType
  severity: AlertSeverity
  title: string
  description: string
  vvsBefore?: number
  vvsAfter?: number
  triggeringSignals?: unknown
}): Promise<void> {
  const supplier = await prisma.supplier.findUnique({
    where: { id: data.supplierId },
    select: { organizationId: true, name: true },
  })

  if (!supplier) throw new NotFoundError("Supplier")

  const alert = await prisma.alert.create({
    data: {
      supplierId: data.supplierId,
      alertType: data.alertType,
      severity: data.severity,
      title: data.title,
      description: data.description,
      vvsBefore: data.vvsBefore,
      vvsAfter: data.vvsAfter,
      triggeringSignals: data.triggeringSignals ?? undefined,
      status: "UNREAD",
    },
    include: {
      supplier: { select: { name: true, country: true } },
    },
  })

  emitToOrganization(supplier.organizationId, "alert:new", alert)
}

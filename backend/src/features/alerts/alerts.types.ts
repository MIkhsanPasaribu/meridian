export type AlertType =
  | "vvs_spike"
  | "new_stage_entered"
  | "critical_signal"
  | "regulation_change"
  | "executive_departure"
  | "scan_completed"
  | "report_ready"

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info"

export interface Alert {
  id: string
  organizationId: string
  supplierId: string
  supplierName: string
  alertType: AlertType
  severity: AlertSeverity
  title: string
  description: string
  vvsBefore?: number
  vvsAfter?: number
  isAcknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  createdAt: string
}

export interface AlertListQuery {
  page?: number
  limit?: number
  severity?: AlertSeverity
  supplierId?: string
  isAcknowledged?: boolean
}

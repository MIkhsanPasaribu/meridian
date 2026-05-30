export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
  error: string | null
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type VvsStage = "MURMUR" | "RIPPLE" | "WAVE" | "SURGE"

export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO"

export type AlertStatus = "UNREAD" | "READ" | "ACKNOWLEDGED" | "DISMISSED"

export type JobStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"

export type Role = "SUPER_ADMIN" | "ADMIN" | "ANALYST" | "VIEWER"

export type ReportType = "INTELLIGENCE_BRIEF" | "CSDDD" | "UFLPA" | "LKSG"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatarUrl?: string | null
  organizationId: string
  organizationName: string
}

export interface Supplier {
  id: string
  name: string
  country: string
  industry: string
  websiteUrl?: string | null
  description?: string | null
  tier: number
  tags: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  vvsReadings?: VvsReading[]
  _count?: {
    alerts: number
    signalEvents: number
  }
}

export interface VvsReading {
  id: string
  supplierId: string
  score: number
  stage: import("./api.types").VvsStage
  delta: number
  signalCount: number
  recordedAt: string
}

export interface Alert {
  id: string
  supplierId: string
  alertType: string
  severity: import("./api.types").AlertSeverity
  title: string
  description: string
  vvsBefore?: number | null
  vvsAfter?: number | null
  status: import("./api.types").AlertStatus
  createdAt: string
  supplier?: {
    name: string
    country: string
  }
}

export interface MonitoringJob {
  id: string
  supplierId: string
  jobType: string
  status: import("./api.types").JobStatus
  priority: number
  createdAt: string
  startedAt?: string | null
  completedAt?: string | null
  supplier?: {
    name: string
    country: string
  }
}

export interface ComplianceReport {
  id: string
  supplierId: string
  reportType: import("./api.types").ReportType
  regulation: string
  title: string
  status: string
  content?: Record<string, unknown>
  vvsScore?: number | null
  vvsStage?: import("./api.types").VvsStage | null
  gapCount?: number
  createdAt: string
  supplier?: {
    name: string
    country: string
  }
}

export interface DashboardOverview {
  totalSuppliers: number
  activeJobs: number
  unreadAlerts: number
  recentAlerts: Alert[]
  recentBriefs: ComplianceReport[]
  vvsDistribution: {
    MURMUR: number
    RIPPLE: number
    WAVE: number
    SURGE: number
  }
}

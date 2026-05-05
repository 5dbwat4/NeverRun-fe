export type SiteStatus = 'ok' | 'error' | 'pending'

export interface ConfigSiteItem {
  searchIndexUrl: string
  baseUrl: string | null
  name: string | null
  lastCrawledAt: string | null
  status: SiteStatus
  errorMessage: string | null
  documentCount: number
  inProgress: boolean
}

export interface ConfigSummary {
  totalSites: number
  successSites: number
  failedSites: number
  pendingSites: number
}

export interface ConfigCrawlRuntime {
  isCrawling: boolean
  startedAt: string | null
  currentSite: string | null
  inProgressCount: number
}

export interface ConfigStatusResponse {
  crawl: ConfigCrawlRuntime
  summary: ConfigSummary
  sites: ConfigSiteItem[]
}

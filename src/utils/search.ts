export type SearchField = 'title' | 'content'

export interface SearchItem {
  title: string
  titleHighlighted: string
  url: string
  snippet: string
  snippetHighlighted: string
  siteName: string
  siteBaseUrl: string
  score: number
}

export interface SearchResponse {
  total: number
  page: number
  pageSize: number
  query: string
  field: SearchField
  results: SearchItem[]
}

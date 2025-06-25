import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const { data: storageDemo, dataReady: storageDemoReady } = useWebExtensionStorage('webext-demo', 'Storage Demo')

export interface SearchHistoryItem {
  username: string
  emails: string[]
  timestamp: number
  avatarUrl?: string
  name?: string
}

export const { data: searchHistory, dataReady: searchHistoryReady } = useWebExtensionStorage<SearchHistoryItem[]>('github-search-history', [])

export function addToSearchHistory(item: SearchHistoryItem) {
  if (!searchHistory.value) {
    searchHistory.value = []
  }

  // Remove existing entry for the same username
  searchHistory.value = searchHistory.value.filter(h => h.username !== item.username)

  // Add new entry at the beginning
  searchHistory.value.unshift(item)

  // Keep only the last 20 searches
  if (searchHistory.value.length > 20) {
    searchHistory.value = searchHistory.value.slice(0, 20)
  }
}

export function clearSearchHistory() {
  searchHistory.value = []
}

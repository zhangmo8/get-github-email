<script setup lang="ts">
import { computed, ref } from 'vue'
import { githubEmailFinder } from '~/logic/github'
import { addToSearchHistory, clearSearchHistory, searchHistory, searchHistoryReady } from '~/logic/storage'

interface SearchResult {
  username: string
  emails: string[]
  userInfo?: {
    name?: string
    avatar_url?: string
    bio?: string
    public_repos?: number
    followers?: number
  }
  error?: string
}

const username = ref('')
const isLoading = ref(false)
const searchResult = ref<SearchResult | null>(null)
const showHistory = ref(false)

const hasEmails = computed(() => searchResult.value?.emails && searchResult.value.emails.length > 0)
const hasError = computed(() => !!searchResult.value?.error)

async function searchUser() {
  if (!username.value.trim()) {
    return
  }

  isLoading.value = true
  searchResult.value = null

  try {
    const userInfo = await githubEmailFinder.getUserInfo(username.value.trim())
    const emails = await githubEmailFinder.getUserEmails(username.value.trim())

    const result: SearchResult = {
      username: username.value.trim(),
      emails,
      userInfo: {
        name: userInfo.name || undefined,
        avatar_url: userInfo.avatar_url,
        bio: userInfo.bio || undefined,
        public_repos: userInfo.public_repos,
        followers: userInfo.followers,
      },
    }

    searchResult.value = result

    // Add to search history if emails found
    if (emails.length > 0) {
      addToSearchHistory({
        username: result.username,
        emails: result.emails,
        timestamp: Date.now(),
        avatarUrl: result.userInfo?.avatar_url,
        name: result.userInfo?.name || undefined,
      })
    }
  }
  catch (error) {
    let errorMessage = 'Unknown error occurred'

    if (error instanceof Error) {
      errorMessage = error.message
    }
    else if (typeof error === 'string') {
      errorMessage = error
    }

    searchResult.value = {
      username: username.value.trim(),
      emails: [],
      error: errorMessage,
    }
  }
  finally {
    isLoading.value = false
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function searchFromHistory(historyItem: any) {
  username.value = historyItem.username
  searchResult.value = {
    username: historyItem.username,
    emails: historyItem.emails,
    userInfo: {
      name: historyItem.name,
      avatar_url: historyItem.avatarUrl,
    },
  }
  showHistory.value = false
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    searchUser()
  }
}
</script>

<template>
  <main class="w-[400px] px-4 py-4 bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        <h1 class="text-lg font-semibold text-gray-900">
          GitHub Email Finder
        </h1>
      </div>
      <button
        class="text-sm text-gray-500 hover:text-gray-700"
        @click="showHistory = !showHistory"
      >
        {{ showHistory ? 'Search' : 'History' }}
      </button>
    </div>

    <!-- Search Form -->
    <div v-if="!showHistory" class="space-y-4">
      <div class="relative">
        <input
          v-model="username"
          type="text"
          placeholder="Enter GitHub username..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          :disabled="isLoading"
          @keypress="handleKeyPress"
        >
        <button
          class="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !username.trim()"
          @click="searchUser"
        >
          {{ isLoading ? '...' : 'Search' }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>

      <!-- Search Results -->
      <div v-if="searchResult && !isLoading" class="space-y-4">
        <!-- User Info -->
        <div v-if="searchResult.userInfo" class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <img
            v-if="searchResult.userInfo.avatar_url"
            :src="searchResult.userInfo.avatar_url"
            :alt="searchResult.username"
            class="w-12 h-12 rounded-full"
          >
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">
              {{ searchResult.userInfo.name || searchResult.username }}
            </h3>
            <p v-if="searchResult.userInfo.bio" class="text-sm text-gray-600 truncate">
              {{ searchResult.userInfo.bio }}
            </p>
            <div class="flex space-x-4 text-xs text-gray-500 mt-1">
              <span v-if="searchResult.userInfo.public_repos">
                {{ searchResult.userInfo.public_repos }} repos
              </span>
              <span v-if="searchResult.userInfo.followers">
                {{ searchResult.userInfo.followers }} followers
              </span>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="hasError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm">
            ❌ {{ searchResult.error }}
          </p>
        </div>

        <!-- Email Results -->
        <div v-if="hasEmails" class="space-y-2">
          <h4 class="font-semibold text-gray-900">
            Found {{ searchResult.emails.length }} email{{ searchResult.emails.length > 1 ? 's' : '' }}:
          </h4>
          <div class="space-y-2">
            <div
              v-for="email in searchResult.emails"
              :key="email"
              class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <span class="text-green-800 font-mono text-sm">{{ email }}</span>
              <button
                class="text-green-600 hover:text-green-800 text-sm font-medium"
                @click="copyToClipboard(email)"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <!-- No Emails Found -->
        <div v-if="!hasError && !hasEmails" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-yellow-700 text-sm">
            ⚠️ No public email found for this user. The email might be private or not set in their profile.
          </p>
        </div>
      </div>
    </div>

    <!-- Search History -->
    <div v-if="showHistory" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-gray-900">
          Search History
        </h3>
        <button
          v-if="searchHistory && searchHistory.length > 0"
          class="text-sm text-red-500 hover:text-red-700"
          @click="clearSearchHistory"
        >
          Clear All
        </button>
      </div>

      <div v-if="searchHistoryReady && searchHistory && searchHistory.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
        <div
          v-for="item in searchHistory"
          :key="item.username"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
          @click="searchFromHistory(item)"
        >
          <div class="flex items-center space-x-3">
            <img
              v-if="item.avatarUrl"
              :src="item.avatarUrl"
              :alt="item.username"
              class="w-8 h-8 rounded-full"
            >
            <div>
              <p class="font-medium text-gray-900">
                {{ item.name || item.username }}
              </p>
              <p class="text-sm text-gray-600">
                {{ item.emails.length }} email{{ item.emails.length > 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <span class="text-xs text-gray-400">
            {{ new Date(item.timestamp).toLocaleDateString() }}
          </span>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-500">
        <p>No search history yet</p>
        <p class="text-sm">
          Search for GitHub users to see history here
        </p>
      </div>
    </div>
  </main>
</template>

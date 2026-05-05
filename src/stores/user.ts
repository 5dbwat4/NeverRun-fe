import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { encode, decode } from '@/utils/codec'

export interface SportIdEntry {
  sport_id: string
  timestamp: string
  used: boolean
}

export const useUserStore = defineStore('user', () => {
  const username = useStorage<string>('neverrun-username', '')
  const token = useStorage<string>('neverrun-token', '')
  const encodedPassword = useStorage<string>('neverrun-password', '')
  const isFirstTime = useStorage<boolean>('neverrun-first-time', true)
  const sportIds = useStorage<SportIdEntry[]>('neverrun-sport-ids', [])

  const hasPassword = computed(() => encodedPassword.value !== '')

  const sportIdsCount = computed(() => sportIds.value.length)
  const unusedSportIdsCount = computed(() => sportIds.value.filter(e => !e.used).length)

  function setCredentials(u: string, t: string) {
    username.value = u
    token.value = t
    isFirstTime.value = false
  }

  async function savePassword(plain: string) {
    encodedPassword.value = await encode(plain)
  }

  async function loadPassword(): Promise<string> {
    if (!encodedPassword.value) return ''
    return decode(encodedPassword.value)
  }

  function addSportId(sport_id: string, timestamp: string) {
    sportIds.value = [...sportIds.value, { sport_id, timestamp, used: false }]
  }

  function markSportIdUsed(sport_id: string) {
    const entry = sportIds.value.find(e => e.sport_id === sport_id)
    if (entry) entry.used = true
  }

  function clear() {
    username.value = ''
    token.value = ''
    encodedPassword.value = ''
    isFirstTime.value = true
  }

  function clearAllSportIds() {
    sportIds.value = []
  }

  function clearUsedSportIds() {
    sportIds.value = sportIds.value.filter(e => !e.used)
  }

  return {
    username,
    token,
    encodedPassword,
    sportIds,
    hasPassword,
    sportIdsCount,
    unusedSportIdsCount,
    isFirstTime,
    setCredentials,
    savePassword,
    loadPassword,
    addSportId,
    markSportIdUsed,
    clear,
    clearAllSportIds,
    clearUsedSportIds
  }
})

<template>
  <section class="first-time-page">
    <header class="heading-row">
      <h2>First Time Setup</h2>
    </header>

    <UCard v-if="!verifiedUser">
      <p class="intro">Welcome to NeverRun. Seems like you are first time use it. You need to configure your personal information to continue.</p>

      <UTabs :items="tabs" class="w-full">
        <template #password>
          <UCard>
            <p class="tab-desc">Please input your ZJUAM username and password. Those data will be sent to the server for authentication only and will not be stored.</p>
            <UForm class="setup-form" :state="passwordState" :validate="validatePassword" :validate-on="['blur']" @submit="savePassword">
              <UFormField label="ZJU Username" name="username" required>
                <UInput class="w-full"
                  v-model="passwordState.username"
                  placeholder="3240109999"
                  autocomplete="username"
                  :disabled="saving"
                />
              </UFormField>
              <UFormField label="Password" name="password" required>
                <UInput class="w-full"
                  v-model="passwordState.password"
                  type="password"
                  placeholder="your_passw0rd"
                  autocomplete="current-password"
                  :disabled="saving"
                />
              </UFormField>
              <UButton type="submit" color="primary" :loading="saving" block>
                Save
              </UButton>
              <p v-if="error" class="mt-2 text-[0.9rem] text-[--ns-danger]">{{ error }}</p>
            </UForm>
          </UCard>
        </template>

        <template #token>
          <UCard>
            <p class="tab-desc">
              It's annoying to input username and password, as well as send them to our server. If you are concerned about security, you can choose to use token instead. Please visit the following page:
              <br/>
              <a href="https://zjuam.zju.edu.cn/cas/login?service=http://www.tyys.zju.edu.cn/cgapp-server/cas/appLogin" target="_blank" rel="noopener" class="external-link">
                https://zjuam.zju.edu.cn/cas/login?service=http://www.tyys.zju.edu.cn/cgapp-server/cas/appLogin
                <UIcon name="i-lucide-external-link" class="external-icon" />
              </a>
              <br />
              Finish the ZJUAM official login process, and then copy the entire HTML source content of the final page (It should be look like a blank page) and paste it into the textarea below.
              <br />
              That data only contains: 1. your username, and 2. the JWT token used for authentication.
            </p>
            <UForm class="setup-form" :state="tokenState" :validate="validateToken" :validate-on="['blur']" @submit="saveToken">
              <UFormField label="HTML Source" name="token" required>
                <UTextarea class="w-full"
                  v-model="tokenState.token"
                  placeholder="Paste the source content here..."
                  :rows="8"
                  :disabled="saving"
                />
              </UFormField>
              <UButton type="submit" color="primary" :loading="saving" block>
                Save
              </UButton>
              <p v-if="error" class="mt-2 text-[0.9rem] text-[--ns-danger]">{{ error }}</p>
            </UForm>
          </UCard>
        </template>
      </UTabs>

      <p class="mt-4 text-[0.83rem] text-[--ns-muted] opacity-75 font-['DM_Sans',system-ui]">Your username and password will be sent to the server, and we will not store them. For more view Privacy &amp; Terms page.</p>
    </UCard>

    <UCard v-if="verifiedUser">
      <template #header>
        <h3 class="card-title">Is it you?</h3>
      </template>

      <p class="confirm-desc">Then everything you provided seems OK to us.</p>

      <div class="info-table">
        <div class="info-row">
          <span class="info-label">xh</span>
          <span class="info-value">{{ verifiedUser.xh }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">xm</span>
          <span class="info-value">{{ verifiedUser.xm }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">xymc</span>
          <span class="info-value">{{ verifiedUser.xymc }}</span>
        </div>
      </div>

      <UButton color="primary" block class="mt-4" trailing @click="onContinue">
        Continue
      </UButton>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { TabsItem, FormError } from '@nuxt/ui'
import { useUserStore } from '@/stores/user'
import { encode } from '@/utils/codec'

const router = useRouter()
const store = useUserStore()

const tabs = ref<TabsItem[]>([
  { label: 'Username & Password', icon: 'i-lucide-user', slot: 'password' },
  { label: 'Token', icon: 'i-lucide-key', slot: 'token' }
])

const passwordState = reactive({
  get username() { return store.username },
  set username(v: string) { store.username = v },
  password: ''
})

const tokenState = reactive({
  get token() { return store.token },
  set token(v: string) { store.token = v }
})

const saving = ref(false)
const error = ref('')

interface GetTokenResponse {
  username: string
  token: string
}

interface VerifyTokenResponse {
  xh: string
  xm: string
  xymc: string
  token: string
}

const verifiedUser = ref<VerifyTokenResponse | null>(null)

onMounted(async () => {
  if (store.hasPassword) {
    passwordState.password = await store.loadPassword()
  }
})

function validatePassword(state: { username: string; password: string }): FormError[] {
  const errors: FormError[] = []
  if (!state.username?.trim()) {
    errors.push({ name: 'username', message: 'Username is required' })
  }
  if (!state.password?.trim()) {
    errors.push({ name: 'password', message: 'Password is required' })
  }
  return errors
}

function validateToken(state: { token: string }): FormError[] {
  const errors: FormError[] = []
  if (!state.token?.trim()) {
    errors.push({ name: 'token', message: 'Token data is required' })
  }
  return errors
}

async function doVerify(username: string, token: string) {
  const response = await fetch('./api/verifyToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, token })
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `验证失败 (${response.status})`)
  }
  const data = (await response.json()) as VerifyTokenResponse
  store.setCredentials(data.xh, data.token)
  verifiedUser.value = data
}

async function savePassword() {
  saving.value = true
  error.value = ''
  try {
    const encodedPassword = await encode(passwordState.password)
    const response = await fetch('./api/getToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: passwordState.username.trim(),
        password: encodedPassword
      })
    })
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail || `保存失败 (${response.status})`)
    }
    const data = (await response.json()) as GetTokenResponse
    await store.savePassword(passwordState.password)
    await doVerify(data.username, data.token)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    saving.value = false
  }
}

async function saveToken() {
  saving.value = true
  error.value = ''
  try {
    const source = tokenState.token.trim()
    const m = source.match(/window\.app\.getUserName\('(\d+)',\s*'([^']+)'\)/)
    if (!m) {
      throw new Error('无法从源码中提取 token，请确认已完整复制 HTML 源码')
    }
    await doVerify(m[1], m[2])
  } catch (err) {
    error.value = err instanceof Error ? err.message : '验证失败'
  } finally {
    saving.value = false
  }
}

function onContinue() {
  router.push('/')
}
</script>

<style scoped>
.first-time-page {
  width: min(980px, 100%);
  margin: 0 auto;
}

.heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.heading-row h2 {
  margin: 0;
  font-size: 1.3rem;
  font-family: 'Monomakh', system-ui;
}

.intro {
  margin-bottom: 1rem;
  color: var(--ns-text);
  line-height: 1.625;
  font-family: 'DM Sans', system-ui;
}

.tab-desc {
  margin-bottom: 1rem;
  color: var(--ns-muted);
  line-height: 1.625;
  font-family: 'DM Sans', system-ui;
}

.tab-desc a {
  color: var(--ns-link);
  text-decoration: none;
}

.tab-desc a:hover {
  text-decoration: underline;
}

.external-link {
  color: #3b82f6 !important;
  text-decoration: underline;
  text-decoration-style: dashed;
  text-underline-offset: 0.25em;
}

.external-link:hover {
  color: #2563eb !important;
  text-decoration: underline;
  text-decoration-style: dashed;
}

.external-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 0.25em;
  font-size: 0.85em;
  opacity: 0.7;
}

.tab-desc :deep(strong) {
  color: var(--ns-text-strong);
  font-weight: 600;
}

.setup-form {
  max-width: 420px;
  margin-inline: auto;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-family: 'Monomakh', system-ui;
}

.confirm-desc {
  margin: 0 0 1rem;
  color: var(--ns-muted);
  line-height: 1.625;
  font-family: 'DM Sans', system-ui;
}

.info-table {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--ns-border);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 80px;
  flex-shrink: 0;
  color: var(--ns-muted);
  font-size: 0.9rem;
  font-family: 'DM Sans', system-ui;
}

.info-value {
  color: var(--ns-text);
  font-size: 0.9rem;
  font-family: 'DM Sans', system-ui;
}
</style>

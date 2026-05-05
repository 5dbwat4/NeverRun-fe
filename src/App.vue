<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
// import Fallback from "./components/fallback.vue";
import Loading from "./components/loading.vue";
import { router } from "./router";

const stars = ref<number | null>(null);
const forks = ref<number | null>(null);
const isThemeReady = ref(false);
const isDark = ref(false);

const themeIcon = computed(() =>
  isDark.value ? "i-lucide-moon" : "i-lucide-sun",
);

function applyTheme(nextDark: boolean) {
  isDark.value = nextDark;
  document.documentElement.setAttribute(
    "data-theme",
    nextDark ? "dark" : "light",
  );
  localStorage.setItem("notebookshelf-theme", nextDark ? "dark" : "light");
}

function toggleTheme() {
  applyTheme(!isDark.value);
}

async function fetchGithubStats() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/5dbwat4/notebookshelf",
    );
    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as {
      stargazers_count?: number;
      forks_count?: number;
    };

    stars.value = payload.stargazers_count ?? 0;
    forks.value = payload.forks_count ?? 0;
  } catch {
    stars.value = null;
    forks.value = null;
  }
}

onMounted(() => {
  const saved = localStorage.getItem("notebookshelf-theme");
  if (saved === "dark") {
    applyTheme(true);
  } else if (saved === "light") {
    applyTheme(false);
  } else {
    applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  isThemeReady.value = true;
  void fetchGithubStats();
});
</script>

<template>
  <UApp>
    <main class="page-wrap">
      <section class="hero">
        <div class="hero-main">
          <h1>NeverRun</h1>
          <p>Tired of the iOS lock-in of RealRun? Then switch to NeverRun.</p>
          <p class="nav-links">
            <router-link to="/">Run</router-link>
            <span>|</span>
            <!-- <router-link to="/config">Runs</router-link>
            <span>|</span> -->
            <router-link to="/manage">Manage</router-link>
            <span>|</span>
            <router-link to="/about">About</router-link>
            <!-- <a
              href="https://github.com/5dbwat4/notebookshelf"
              target="_blank"
              rel="noopener noreferrer"
              >GitHub
              <span class="repo-stats">
                <span>
                  <UIcon name="i-lucide-star" />
                  {{ stars ?? "-" }}
                </span>
                <span>
                  <UIcon name="i-lucide-git-fork" />
                  {{ forks ?? "-" }}
                </span>
              </span>
            </a> -->
          </p>
        </div>

        <!-- <div class="hero-tools">
          <UButton
            v-if="isThemeReady"
            :icon="themeIcon"
            color="neutral"
            variant="outline"
            @click="toggleTheme"
          >
            {{ isDark ? 'Dark' : 'Light' }}
          </UButton>

          <a
            class="github-card"
            href="https://github.com/5dbwat4/notebookshelf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="gh-icon-wrap">
              <UIcon name="i-simple-icons-github" class="gh-icon" />
            </div>
            <div class="gh-meta">
              <p class="repo-name">5dbwat4/notebookshelf</p>
              <p class="repo-stats">
                <span>
                  <UIcon name="i-lucide-star" />
                  {{ stars ?? '-' }}
                </span>
                <span>
                  <UIcon name="i-lucide-git-fork" />
                  {{ forks ?? '-' }}
                </span>
              </p>
            </div>
          </a>
        </div> -->
      </section>

      <div class="content">
        <!-- <Suspense>
          <Transition name="fade" mode="out-in">
            <RouterView />
          </Transition>
          <template #fallback>
            <Fallback />
          </template>
          <template #pending>
            <Loading />
          </template>
        </Suspense> -->
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <Transition name="fade" mode="out-in">
              <KeepAlive>
                <Suspense>
                  <component :is="Component"></component>
                
                  <template #fallback>
                    <Loading />
                  </template>
                </Suspense>
              </KeepAlive>
            </Transition>
          </template>
        </RouterView>
      </div>
    </main>
  </UApp>
</template>

<style scoped>
.page-wrap {
  min-height: 100vh;
  padding: 3rem 1.25rem 4rem;
  color: var(--ns-text);
  background: var(--ns-bg);

  --ns-bg: #fff;
  --ns-surface: rgba(255, 255, 255, 0.9);
  --ns-surface-soft: rgba(255, 255, 255, 0.58);
  --ns-surface-hover: rgba(250, 253, 252, 1);
  --ns-border: #9eb4ad;
  --ns-text: #1f3b33;
  --ns-text-strong: #113e34;
  --ns-muted: #4c665f;
  --ns-link: #1f7d64;
  --ns-danger: #b7354d;
  --ns-mark-bg: rgba(255, 206, 91, 0.55);
  --ns-mark-text: #173f31;
}

.hero {
  width: min(980px, 100%);
  margin: 0 auto 1.3rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.hero-main h1 {
  font-size: 2.25rem;
  margin: 0;
  font-family: "Monomakh", system-ui;
}

.hero-main p {
  font-family: "DM Sans", system-ui;
  margin: 0.2rem 0;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.hero a {
  color: var(--ns-link);
  text-decoration: none;
  transition: color 0.2s;
}

.hero a:hover {
  color: var(--ns-text-strong);
  text-decoration: underline;
}

.hero-tools {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.github-card {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  padding: 0.55rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--ns-border);
  background: var(--ns-surface);
}

.github-card:hover {
  background: var(--ns-surface-hover);
  text-decoration: none;
}

.gh-icon-wrap {
  display: grid;
  place-items: center;
}

.gh-icon {
  font-size: 1.3rem;
}

.gh-meta {
  display: grid;
  gap: 0.15rem;
}

.repo-name {
  margin: 0;
  font-size: 0.82rem;
  color: var(--ns-text-strong);
}

.repo-stats {
  margin: 0;
  display: inline-flex;
  gap: 0.8rem;
  font-size: 0.8rem;
  color: var(--ns-muted);
}

.repo-stats span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.content {
  width: min(980px, 100%);
  margin: 0 auto;
}

:global(html[data-theme="dark"]) .page-wrap {
  --ns-bg: #111;
  --ns-surface: rgba(19, 28, 25, 0.92);
  --ns-surface-soft: rgba(17, 25, 23, 0.82);
  --ns-surface-hover: rgba(24, 34, 31, 0.95);
  --ns-border: #36524a;
  --ns-text: #dcebe6;
  --ns-text-strong: #effaf5;
  --ns-muted: #9fbbb2;
  --ns-link: #7dd6b8;
  --ns-danger: #ff8da2;
  --ns-mark-bg: rgba(255, 202, 82, 0.35);
  --ns-mark-text: #fff3cd;
}

@media (max-width: 860px) {
  .hero {
    flex-direction: column;
  }

  .hero-tools {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

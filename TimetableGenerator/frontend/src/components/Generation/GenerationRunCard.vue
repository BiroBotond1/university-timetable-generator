<template>
  <v-card class="mt-4" variant="outlined">
    <v-card-title class="text-base font-semibold">Last generation</v-card-title>

    <v-card-text v-if="!run || !outcome">
      No timetable has been generated in this project yet.
    </v-card-text>

    <v-card-text v-else>
      <div class="d-flex align-center flex-wrap ga-2">
        <v-chip :color="outcome.color" :prepend-icon="outcome.icon" size="small" label>
          {{ outcome.label }}
        </v-chip>
        <span>{{ summary }}</span>
      </div>

      <v-alert
        v-if="run.message"
        :type="run.status === 'failed' ? 'error' : 'info'"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        {{ run.message }}
      </v-alert>

      <v-alert
        v-if="outcome.color === 'warning'"
        type="warning"
        variant="tonal"
        density="compact"
        class="mt-3"
      >
        The timetable was saved, but some hard constraints are not met.
      </v-alert>

      <p v-if="unchanged" class="mt-2 text-medium-emphasis">
        The previous timetable is unchanged.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { GenerationRunData } from '@/modules/generation/generation.type'
import { durationOf, formatTime, outcomeOf, personName } from '@/modules/generation/generation.format'

const props = defineProps<{ run: GenerationRunData | null }>()

const outcome = computed(() => props.run ? outcomeOf(props.run) : null)

const unchanged = computed(() =>
  !!props.run && ['failed', 'cancelled', 'interrupted'].includes(props.run.status))

const summary = computed(() => {
  const run = props.run
  if (!run) return ''

  const by = `started by ${personName(run.startedBy)}`

  switch (run.status) {
    case 'queued':
      return `Queued since ${formatTime(run.queuedAt)}, waiting for another school, ${by}`
    case 'running':
      return `Running since ${formatTime(run.startedAt)}, ${by}`
    case 'succeeded':
      return `Finished at ${formatTime(run.finishedAt)} after ${durationOf(run)}, ${by}`
    case 'failed':
      return `Failed at ${formatTime(run.finishedAt)} after ${durationOf(run)}, ${by}`
    case 'cancelled':
      return `Cancelled at ${formatTime(run.finishedAt)} by ${personName(run.cancelledBy)}, ${by}`
    case 'interrupted':
      return `Stopped at ${formatTime(run.finishedAt)}, ${by}`
  }
})
</script>

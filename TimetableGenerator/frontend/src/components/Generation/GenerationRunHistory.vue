<template>
  <v-card class="mt-4" variant="outlined">
    <v-card-title class="text-base font-semibold">Recent runs</v-card-title>

    <v-table density="compact">
      <thead>
        <tr>
          <th>Started</th>
          <th>Started by</th>
          <th>Duration</th>
          <th>Outcome</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="run in runs" :key="run._id">
          <td class="text-no-wrap">{{ formatTime(run.startedAt ?? run.queuedAt) }}</td>
          <td>{{ personName(run.startedBy) }}</td>
          <td class="text-no-wrap">{{ durationOf(run) }}</td>
          <td>
            <v-chip :color="outcomeOf(run).color" size="x-small" label>{{ outcomeOf(run).label }}</v-chip>
          </td>
          <!-- Cut to one line; the full text is on hover. -->
          <td class="message" :title="messageOf(run)">{{ messageOf(run) }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup lang="ts">
import type { GenerationRunData } from '@/modules/generation/generation.type'
import { durationOf, formatTime, outcomeOf, personName } from '@/modules/generation/generation.format'

defineProps<{ runs: GenerationRunData[] }>()

const messageOf = (run: GenerationRunData) =>
  run.status === 'cancelled' ? `Cancelled by ${personName(run.cancelledBy)}` : (run.message ?? '')
</script>

<style scoped>
.message {
  max-width: 24rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

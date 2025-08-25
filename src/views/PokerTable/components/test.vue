<script
  lang="ts"
  setup
>
import OpponentDeck from "@/views/PokerTable/components/OpponentDeck.vue"
</script>

<template>
  <div class="game-page p-4 flex flex-col h-screen">

    <OpponentDeck
      :discardCount="3"
      :handCount="10"
      :rotate="0"
    />
    <OpponentDeck
      :handCount="10"
      :rotate="135"
      stackMode="vertical"
    />

    <OpponentDeck
      :handCount="10"
      :rotate="90"
      stackMode="vertical"
    />

  </div>
</template>


<style scoped>

</style>

<script lang="ts">
  import { Block, FeaturesTeam, HeroSplit } from "@ui8kit/blocks";
  import { app } from "@ui8kit/blocks";
  import ThemeToggle from "./ThemeToggle.svelte";
</script>

<Block class={app.shell}>
  <FeaturesTeam />
  <HeroSplit />
  <ThemeToggle />
</Block>

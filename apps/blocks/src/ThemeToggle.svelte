<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "@ui8kit/kit";
  import { app, ui } from "@ui8kit/blocks";

  const storageKey = "ui8kit-theme";

  let dark = $state(false);

  function apply(next: boolean): void {
    dark = next;
    document.documentElement.classList.toggle("dark", next);
  }

  onMount(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === "dark") {
      apply(true);
      return;
    }
    if (stored === "light") {
      apply(false);
      return;
    }
    apply(window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  function toggle(): void {
    const next = !dark;
    localStorage.setItem(storageKey, next ? "dark" : "light");
    apply(next);
  }
</script>

<Button
  class={app.themeToggle}
  aria-label={ui.themeToggle.label}
  pressed={dark}
  onclick={toggle}
></Button>

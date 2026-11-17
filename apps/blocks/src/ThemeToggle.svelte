<script lang="ts">
  import { Button } from "@ui8kit/kit";
  import { app, ui } from "@ui8kit/blocks";
  import { appTheme, themeCtl } from "./theme/ctl.svelte";

  const dark = $derived(appTheme.state.mode === "dark");

  function toggle(): void {
    themeCtl.setField("mode", dark ? "light" : "dark");
  }
</script>

<Button class={app.themeToggle} aria-label={ui.themeToggle.label} pressed={dark} onclick={toggle}></Button>

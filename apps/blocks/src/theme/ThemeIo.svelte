<script lang="ts">
  import { Button, Label, Text, Textarea } from "@ui8kit/kit";
  import { Group, Stack } from "@ui8kit/blocks";
  import { themeText } from "../content/theme";
  import { themeCtl } from "./ctl.svelte";

  const text = themeText.io;
  type Status = "" | "copied" | "copyFailed" | "imported" | "partial" | "invalid";
  let value = $state("");
  let status = $state<Status>("");
  let detail = $state("");
  let textKey = $state(0);
  const message = $derived(status ? text[status] + (detail ? ": " + detail : "") : "");

  async function copy(kind: "json" | "css"): Promise<void> {
    value = kind === "css" ? themeCtl.exportCss() : JSON.stringify(themeCtl.exportConfig(), null, 2);
    detail = "";
    textKey += 1;
    try {
      await navigator.clipboard.writeText(value);
      status = "copied";
    } catch {
      status = "copyFailed";
    }
  }
  function load(): void {
    const r = themeCtl.importConfig(value);
    if (r.ok) {
      status = r.dropped.length ? "partial" : "imported";
      detail = r.dropped.join(", ");
    } else {
      status = "invalid";
      detail = r.error;
    }
  }
</script>

<Stack gap="2" class="ui8-theme-io" data-testid="theme-io">
  <Text tag="h3" class="ui8-theme-io-title">{text.title}</Text>
  <Text class="ui8-theme-io-note">{text.note}</Text>
  <Label for="theme-io-text">{text.label}</Label>
  {#key textKey}
    <Textarea
      id="theme-io-text"
      rows={8}
      class="ui8-theme-io-text"
      {value}
      placeholder={text.placeholder}
      oninput={(e: Event) => (value = (e.currentTarget as HTMLTextAreaElement).value)}
      data-testid="theme-io-text"
    />
  {/key}
  <Group gap="2">
    <Button class="ui8-theme-btn" onclick={() => copy("json")} data-testid="theme-export">{text.exportJson}</Button>
    <Button class="ui8-theme-btn" onclick={() => copy("css")} data-testid="theme-export-css">{text.exportCss}</Button>
    <Button class="ui8-theme-btn" disabled={!value.trim()} onclick={load} data-testid="theme-import">{text.import}</Button>
  </Group>
  <Text class="ui8-theme-io-note" role="status" data-testid="theme-io-status">{message}</Text>
</Stack>

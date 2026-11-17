<script lang="ts">
  import { Box, Input, Label, Text } from "@ui8kit/kit";
  import { formatHsl, parseColour, type Palette } from "@ui8kit/theme";
  import type { PaletteText } from "../content/theme";

  let { palette, onchange, text }: { palette: Palette; onchange: (p: Palette) => void; text: PaletteText["options"] } =
    $props();
  const id = "ui8-palette-primary";
  let draft = $state<string | null>(null);
  let bad = $state(false);
  const shown = $derived(draft ?? formatHsl(palette));

  function input(e: Event): void {
    const v = (e.currentTarget as HTMLInputElement).value;
    const c = parseColour(v);
    bad = !c && v.trim() !== "";
    if (!c) {
      draft = v;
      return;
    }
    draft = c.from === "hsl" ? v : null;
    onchange({ ...palette, ...c.hsl });
  }
  const settle = (): void => {
    if (!bad) draft = null;
  };
</script>

<Box class="ui8-palette-options" data-testid="palette-options">
  <Text tag="span" class="ui8-palette-label">{text.title}</Text>
  <Box class="ui8-palette-option">
    <Label for={id} class="ui8-palette-label">{text.primary}</Label>
    <Box class="ui8-palette-primary-row">
      <Box class="ui8-palette-swatch" style={`background:hsl(${formatHsl(palette)})`} aria-hidden="true"></Box>
      <Input
        {id}
        value={shown}
        oninput={input}
        onblur={settle}
        spellcheck="false"
        autocomplete="off"
        aria-describedby={id + "-hint " + id + "-error"}
        data-testid="palette-primary-input"
      />
    </Box>
    <Text tag="span" id={id + "-hint"} class="ui8-palette-muted">{text.hint}</Text>
    <Text tag="span" id={id + "-error"} class="ui8-palette-error" data-testid="palette-primary-error">{bad ? text.error : ""}</Text>
  </Box>
</Box>

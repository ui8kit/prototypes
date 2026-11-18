<!-- The Theme sheet: one native modal dialog (kit Dialog) docked to the right, as in codegen-x/ui8kit apps/stock.
     The narrow Theme panel sits on the right; a wide panel (palette, skins, presets, design system) opens to its left. Esc, Close and a backdrop click close it. -->
<script lang="ts">
  import { Dialog } from "@ui8kit/kit";
  import { Group } from "@ui8kit/blocks";
  import { themeCtl } from "./ctl.svelte";
  import DesignPanel from "./DesignPanel.svelte";
  import PalettePanel from "./PalettePanel.svelte";
  import PresetsPanel from "./PresetsPanel.svelte";
  import SkinPicker from "./SkinPicker.svelte";
  import ThemePanel from "./ThemePanel.svelte";

  const id = "theme-sheet";

  // The kit Dialog does not forward an element ref: find the native dialog by id.
  $effect(() => {
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    if (!dialog) return;
    if (themeCtl.open && !dialog.open) dialog.showModal();
    else if (!themeCtl.open && dialog.open) dialog.close();
  });

  function onclose(): void {
    themeCtl.open = false;
  }

  function onclick(e: MouseEvent): void {
    const d = e.currentTarget as HTMLDialogElement;
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) themeCtl.open = false;
  }
</script>

<Dialog {id} class="ui8-theme-sheet" aria-labelledby="theme-panel-title" {onclose} {onclick} data-testid="theme-sheet">
  {#if themeCtl.open}
    <Group gap="0" align="stretch" class="ui8-theme-sheet-panels" data-wide={themeCtl.wide ? "1" : "0"}>
      {#if themeCtl.wide === "palette"}<PalettePanel />{/if}
      {#if themeCtl.wide === "skins"}<SkinPicker />{/if}
      {#if themeCtl.wide === "presets"}<PresetsPanel />{/if}
      {#if themeCtl.wide === "design"}<DesignPanel />{/if}
      <ThemePanel />
    </Group>
  {/if}
</Dialog>

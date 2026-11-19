// The writing direction of the preview: the Theme panel's LTR / RTL choice is `dir` on the feed (the preview root, not the
// app chrome), saved with the other theme settings; the blocks draw the same DOM in both (logical classes, align start /
// end follow dir), so the RTL feed is the LTR feed with dir="rtl".
import { render } from "@testing-library/svelte";
import { afterEach, describe, expect, it } from "vitest";
import { readTheme } from "@ui8kit/theme";
import Gallery from "./Gallery.svelte";
import ThemeFields from "./theme/ThemeFields.svelte";
import { STORAGE_KEY, appTheme, themeCtl } from "./theme/ctl.svelte";

const feed = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-testid="gallery"]')!;

describe("preview direction (theme: ltr | rtl)", () => {
  afterEach(() => themeCtl.reset());

  it("the feed is dir=ltr by default and dir=rtl after the switch; the choice is saved with the theme", async () => {
    const { container, unmount } = render(Gallery);
    expect(feed(container).getAttribute("dir")).toBe("ltr");
    const ltr = feed(container).innerHTML;
    themeCtl.setField("direction", "rtl");
    await Promise.resolve();
    expect(feed(container).getAttribute("dir")).toBe("rtl");
    expect(appTheme.state.theme.direction).toBe("rtl");
    expect(readTheme(STORAGE_KEY).direction).toBe("rtl");
    // the app chrome keeps its own direction: only the preview root turns
    expect(document.documentElement.getAttribute("dir")).toBeNull();
    expect(feed(container).innerHTML).toBe(ltr);
    unmount();
  });

  it("the Theme panel has a labelled LTR / RTL radio group", async () => {
    const { container, unmount } = render(ThemeFields);
    const group = container.querySelector<HTMLElement>('[data-testid="theme-direction"]')!;
    expect(group.getAttribute("role")).toBe("radiogroup");
    const label = document.getElementById(group.getAttribute("aria-labelledby")!)!;
    expect(label.textContent).toMatch(/direction/i);
    const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    expect(radios.map((r) => r.value)).toEqual(["ltr", "rtl"]);
    expect(radios.map((r) => r.checked)).toEqual([true, false]);
    radios[1]!.click();
    await Promise.resolve();
    expect(appTheme.state.theme.direction).toBe("rtl");
    unmount();
  });
});

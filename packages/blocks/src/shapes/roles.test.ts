import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { role } from "../classes";
import Avatar from "./Avatar.svelte";
import CtaShape from "./CtaShape.svelte";
import Heading from "./Heading.svelte";
import Media from "./Media.svelte";
import Surface from "./Surface.svelte";
import TextLine from "./TextLine.svelte";

const TOKEN = /^bg-(muted|secondary|primary|accent|card)$/;
const HEIGHT = /^h-\d+$/;

function first(container: Element, selector: string): Element {
  const node = container.querySelector(selector);
  expect(node, selector).not.toBeNull();
  return node as Element;
}

function hasAll(node: Element, classes: string): void {
  for (const c of classes.split(" ")) expect(node.classList.contains(c), `${c} on ${node.outerHTML}`).toBe(true);
}

describe("semantic roles", () => {
  it("each role uses exactly one shadcn token and plain rounded", () => {
    for (const [name, cls] of Object.entries(role)) {
      const parts = cls.split(" ");
      expect(parts.filter((p) => TOKEN.test(p)), name).toHaveLength(1);
      expect(parts.some((p) => /^rounded-(sm|md|lg|xl|2xl|3xl)$/.test(p)), name).toBe(false);
    }
  });

  it("bar roles differ by token or height (lead = text bar, drawn wider)", () => {
    expect(role.lead).toBe(role.text);
    const bars = ["text", "heading", "headingLg", "ctaPrimary", "ctaSecondary"] as const;
    const keys = bars.map((b) => {
      const parts = role[b].split(" ");
      return `${parts.find((p) => TOKEN.test(p))}|${parts.find((p) => HEIGHT.test(p))}`;
    });
    expect(new Set(keys).size).toBe(bars.length);
  });

  it("shapes render their role classes", () => {
    hasAll(first(render(TextLine).container, '[data-role="text"]'), role.text);
    hasAll(first(render(TextLine, { props: { size: "lead" } }).container, '[data-role="lead"]'), role.lead);
    hasAll(first(render(Heading).container, '[data-role="heading"]'), role.heading);
    hasAll(first(render(Heading, { props: { size: "lg" } }).container, '[data-role="heading-lg"]'), role.headingLg);
    hasAll(first(render(CtaShape).container, '[data-role="cta-primary"]'), role.ctaPrimary);
    hasAll(first(render(CtaShape, { props: { tone: "secondary" } }).container, '[data-role="cta-secondary"]'), role.ctaSecondary);
    const avatar = first(render(Avatar).container, '[data-role="accent"]');
    hasAll(avatar, `${role.accent} rounded-full`);
    hasAll(first(render(Media).container, '[data-role="media"]'), role.media);
    hasAll(first(render(Surface).container, '[data-role="surface"]'), role.surface);
  });

  it("media shows the light image by default and the dark one only under .dark", () => {
    const imgs = render(Media).container.querySelectorAll("img");
    expect(imgs).toHaveLength(2);
    expect(imgs[0].classList.contains("dark:hidden")).toBe(true);
    expect(imgs[1].classList.contains("hidden")).toBe(true);
    expect(imgs[1].classList.contains("dark:block")).toBe(true);
  });
});

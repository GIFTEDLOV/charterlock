import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { AppLayout, DocsLayout, PublicLayout } from "./layouts";

function renderLayout(layout: ReactNode, path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route element={layout}><Route path="*" element={<Outlet />} /></Route></Routes></MemoryRouter>);
}

describe("CharterLock shell architecture", () => {
  it("keeps public routes free of the application sidebar", () => {
    renderLayout(<PublicLayout />, "/proof");
    expect(screen.getByRole("navigation", { name: "Public navigation" })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Application navigation" })).toBeNull();
  });

  it("gives the operational application its own sidebar and mobile navigation", () => {
    renderLayout(<AppLayout />, "/app");
    expect(screen.getByRole("navigation", { name: "Application navigation" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Mobile application navigation" })).toBeTruthy();
  });

  it("keeps docs in the public header with a dedicated documentation nav", () => {
    renderLayout(<DocsLayout />, "/docs");
    expect(screen.getByRole("navigation", { name: "Public navigation" })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Application navigation" })).toBeNull();
  });

  it("does not mount the rejected global network warning", () => {
    renderLayout(<AppLayout />, "/app");
    expect(document.querySelectorAll(".mode-banner")).toHaveLength(0);
    expect(document.querySelectorAll(".contextual-write-note")).toHaveLength(0);
  });
});

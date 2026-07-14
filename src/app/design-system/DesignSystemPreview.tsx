"use client"

import { useState } from "react"
import { MotionConfig } from "framer-motion"
import { HeartPulse, Mail, Sparkles, Users } from "lucide-react"

import { Container } from "@/components/design-system/layout/Container"
import { Section } from "@/components/design-system/layout/Section"
import { SiteHeader } from "@/components/design-system/layout/SiteHeader"
import { SiteFooter } from "@/components/design-system/layout/SiteFooter"
import { Button, LinkButton } from "@/components/design-system/ui/Button"
import { IconCircle } from "@/components/design-system/ui/IconCircle"
import { Eyebrow } from "@/components/design-system/ui/Eyebrow"
import { Card } from "@/components/design-system/ui/Card"
import { Input } from "@/components/design-system/ui/Input"
import { SelectField } from "@/components/design-system/ui/SelectField"
import { DateField } from "@/components/design-system/ui/DateField"
import { Chip } from "@/components/design-system/ui/Chip"

const COLOR_SWATCHES = [
  { name: "navy-950", value: "#061a3a", var: "--navy-950", on: "light" },
  { name: "navy-800", value: "#163357", var: "--navy-800", on: "light" },
  { name: "blue-600", value: "#0876c9", var: "--blue-600", on: "light" },
  { name: "green-600", value: "#1d9e75", var: "--green-600", on: "light" },
  { name: "teal-500", value: "#10bfa5", var: "--teal-500", on: "light" },
  { name: "mint-100", value: "#eafaf5", var: "--mint-100", on: "dark" },
  { name: "blue-100", value: "#eaf5fc", var: "--blue-100", on: "dark" },
  { name: "border", value: "#dce7ed", var: "--border", on: "dark" },
  { name: "text-muted", value: "#5f7189", var: "--text-muted", on: "light" },
  { name: "error", value: "#d92d48", var: "--error", on: "light" },
  { name: "canvas", value: "#ffffff", var: "--canvas", on: "dark" },
  { name: "canvas-subtle", value: "#f7fbfc", var: "--canvas-subtle", on: "dark" },
] as const

const RADIUS_SWATCHES = [
  { name: "header shell", var: "--radius-header", note: "24-28px" },
  { name: "hero image", var: "--radius-hero-image", note: "28-32px" },
  { name: "large section", var: "--radius-section", note: "32-36px" },
  { name: "card (form)", var: "--radius-card-lg", note: "22-24px" },
  { name: "card (small)", var: "--radius-card-sm", note: "14-16px" },
  { name: "input", var: "--radius-input", note: "9-11px" },
  { name: "button", var: "--radius-button", note: "10-12px" },
  { name: "circular icon", var: "--radius-circle", note: "fully rounded" },
] as const

const SHADOW_SWATCHES = [
  { name: "shadow-sm", var: "--shadow-sm" },
  { name: "shadow-md", var: "--shadow-md" },
  { name: "shadow-lg", var: "--shadow-lg" },
] as const

const CATEGORY_CHIPS = ["All", "Nutrition", "Cardiac", "Surgery", "Mental Health", "Pediatrics"]

function DemoSection({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Section id={id} spacing="md" as="section" className="border-t border-[var(--border)] first:border-t-0">
      <Container>
        <div className="mb-8 max-w-2xl">
          <Eyebrow>{title}</Eyebrow>
          {description && <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-muted)]">{description}</p>}
        </div>
        {children}
      </Container>
    </Section>
  )
}

function SwatchLabel({ name, sub }: { name: string; sub: string }) {
  return (
    <div className="mt-3">
      <p className="text-[13px] font-semibold text-[var(--navy-950)]">{name}</p>
      <p className="text-[12px] text-[var(--text-muted)]">{sub}</p>
    </div>
  )
}

export function DesignSystemPreview() {
  const [inputValue, setInputValue] = useState("")

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[var(--canvas-subtle)] text-[var(--navy-950)]">
        {/* ── Review banner ───────────────────────────────────────────────── */}
        <div className="bg-[var(--navy-950)] py-2.5 text-center text-[13px] font-semibold text-white">
          Design system reference — shared across the public directory and team portal.
        </div>

        {/* ── Header component, demoed with two nav states ───────────────── */}
        <SiteHeader />
        <Container className="mt-3">
          <p className="text-[12px] text-[var(--text-muted)]">↑ default (no active route) · ↓ with &quot;Speakers&quot; forced active, to show the underline</p>
        </Container>
        <div className="mt-3">
          <SiteHeader activeHrefOverride="/speakers" />
        </div>

        <Section spacing="lg">
          <Container>
            <Eyebrow>About the Bureau</Eyebrow>
            <h1
              className="mt-4 max-w-4xl text-[var(--navy-950)]"
              style={{
                fontSize: "var(--type-hero-size)",
                lineHeight: "var(--type-hero-leading)",
                fontWeight: "var(--type-hero-weight)" as unknown as number,
                letterSpacing: "var(--type-hero-tracking)",
              }}
            >
              Putting a face to every expert.
            </h1>
            <p
              className="mt-6 max-w-2xl text-[var(--text-muted)]"
              style={{ fontSize: "var(--type-body-size)", lineHeight: "var(--type-body-leading)", fontWeight: "var(--type-body-weight)" as unknown as number }}
            >
              This is the hero-heading and body-copy scale at full size — resize the window to see the clamp() fluid range between mobile and desktop.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg">Request a Speaker</Button>
              <Button variant="secondary" size="lg">
                Browse Speakers
              </Button>
            </div>
          </Container>
        </Section>

        {/* ── Typography scale ─────────────────────────────────────────────── */}
        <DemoSection id="typography" title="Typography scale" description="Every text style used across the reference pages, at true size and weight.">
          <div className="space-y-8">
            <div>
              <p
                style={{
                  fontSize: "var(--type-hero-size)",
                  lineHeight: "var(--type-hero-leading)",
                  fontWeight: "var(--type-hero-weight)" as unknown as number,
                  letterSpacing: "var(--type-hero-tracking)",
                }}
              >
                Hero heading
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">clamp(48px, 5.2vw, 76px) · line-height 0.98 · weight 780 · tracking -0.045em</p>
            </div>
            <div>
              <Eyebrow>Eyebrow label</Eyebrow>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">12px · weight 750 · tracking 0.18em · uppercase · green-600</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--type-body-size)", lineHeight: "var(--type-body-leading)", fontWeight: "var(--type-body-weight)" as unknown as number, color: "var(--text-muted)" }}>
                Body copy — the standard paragraph style for supporting text under headings, in cards, and in descriptions.
              </p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">clamp(17px, 1.4vw, 20px) · line-height 1.55 · weight 450 · text-muted</p>
            </div>
            <div>
              <p style={{ fontSize: "var(--type-label-size)", fontWeight: "var(--type-label-weight)" as unknown as number }}>Form label</p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">13-14px · weight 650 · navy-950</p>
            </div>
            <p className="text-[13px] text-[var(--text-muted)]">Floor: no body text anywhere in the system should render smaller than 14px.</p>
          </div>
        </DemoSection>

        {/* ── Colors ─────────────────────────────────────────────────────── */}
        <DemoSection id="colors" title="Color tokens" description="Primitives — every component below is built from exactly these.">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {COLOR_SWATCHES.map((c) => (
              <div key={c.name}>
                <div
                  className={`flex h-20 items-end p-3 ${c.on === "dark" ? "text-[var(--navy-950)]" : "text-white"}`}
                  style={{ backgroundColor: c.value, borderRadius: "var(--radius-card-sm)", border: "1px solid var(--border)" }}
                >
                  <span className="text-[11px] font-semibold opacity-80">{c.value}</span>
                </div>
                <SwatchLabel name={c.name} sub={`var(${c.var})`} />
              </div>
            ))}
          </div>
        </DemoSection>

        {/* ── Shadows & radii ───────────────────────────────────────────── */}
        <DemoSection id="elevation" title="Shadows &amp; radii">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="mb-4 text-[13px] font-semibold text-[var(--navy-950)]">Shadows</p>
              <div className="grid grid-cols-3 gap-6">
                {SHADOW_SWATCHES.map((s) => (
                  <div key={s.name}>
                    <div className="h-20 bg-[var(--canvas)]" style={{ borderRadius: "var(--radius-card-sm)", boxShadow: `var(${s.var})` }} />
                    <SwatchLabel name={s.name} sub={`var(${s.var})`} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-[13px] font-semibold text-[var(--navy-950)]">Radii</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {RADIUS_SWATCHES.map((r) => (
                  <div key={r.name}>
                    <div className="h-16 border border-[var(--border)] bg-[var(--mint-100)]" style={{ borderRadius: `var(${r.var})` }} />
                    <SwatchLabel name={r.name} sub={r.note} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DemoSection>

        {/* ── Buttons ───────────────────────────────────────────────────── */}
        <DemoSection id="buttons" title="Button" description="Primary (gradient fill), secondary (outline), ghost. Hover lifts 1px, press scales to 0.98.">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Primary sm</Button>
              <Button size="md">Primary md</Button>
              <Button size="lg">Primary lg</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="secondary" size="sm">
                Secondary sm
              </Button>
              <Button variant="secondary" size="md">
                Secondary md
              </Button>
              <Button variant="secondary" size="lg">
                Secondary lg
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="ghost" size="sm">
                Ghost sm
              </Button>
              <Button variant="ghost" size="md">
                Ghost md
              </Button>
              <LinkButton href="/design-system" variant="primary" size="md">
                LinkButton (real &lt;a&gt;)
              </LinkButton>
            </div>
          </div>
        </DemoSection>

        {/* ── IconCircle & Eyebrow ─────────────────────────────────────── */}
        <DemoSection id="icon-circle" title="IconCircle &amp; Eyebrow">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-4">
              <IconCircle variant="mint" size={56}>
                <HeartPulse className="h-6 w-6" strokeWidth={1.8} />
              </IconCircle>
              <IconCircle variant="outline" size={56}>
                <Users className="h-6 w-6" strokeWidth={1.8} />
              </IconCircle>
              <IconCircle variant="mint" size={40}>
                <Sparkles className="h-4.5 w-4.5" strokeWidth={1.8} />
              </IconCircle>
            </div>
            <Eyebrow>For Community Partners</Eyebrow>
          </div>
        </DemoSection>

        {/* ── Cards ─────────────────────────────────────────────────────── */}
        <DemoSection id="cards" title="Card" description="Base card — radius, shadow, and padding are all configurable. hoverLift is opt-in per usage.">
          <div className="grid gap-6 sm:grid-cols-3">
            <Card radius="lg" shadow="md" padding="lg">
              <p className="text-[13px] font-semibold text-[var(--text-muted)]">radius=&quot;lg&quot; shadow=&quot;md&quot;</p>
              <p className="mt-2 text-[15px] font-semibold">Form-sized card (22-24px)</p>
            </Card>
            <Card radius="sm" shadow="sm" padding="md" hoverLift>
              <p className="text-[13px] font-semibold text-[var(--text-muted)]">radius=&quot;sm&quot; shadow=&quot;sm&quot; hoverLift</p>
              <p className="mt-2 text-[15px] font-semibold">Small card (14-16px) — hover me</p>
            </Card>
            <Card radius="sm" shadow="lg" padding="md">
              <div className="flex items-center gap-3">
                <IconCircle variant="mint" size={40}>
                  <Mail className="h-4.5 w-4.5" strokeWidth={1.8} />
                </IconCircle>
                <div>
                  <p className="text-[15px] font-semibold">Composed example</p>
                  <p className="text-[13px] text-[var(--text-muted)]">Card + IconCircle + type scale</p>
                </div>
              </div>
            </Card>
          </div>
        </DemoSection>

        {/* ── Form fields ───────────────────────────────────────────────── */}
        <DemoSection id="forms" title="Form fields" description="Input, SelectField, DateField — 50-54px tall, 9-11px radius, blue focus ring, red error state.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Your name" placeholder="Jane Smith" value={inputValue} onChange={(e) => setInputValue(e.target.value)} hint="Shown as you type — try it." />
            <Input label="Email" placeholder="jane@example.com" error="Enter a valid email address." defaultValue="not-an-email" />
            <SelectField
              label="Department"
              placeholder="Choose a department"
              options={[
                { label: "Cardiology", value: "cardiology" },
                { label: "Nutrition", value: "nutrition" },
                { label: "Pediatrics", value: "pediatrics" },
              ]}
            />
            <DateField label="Preferred date" />
          </div>
        </DemoSection>

        {/* ── Chips ─────────────────────────────────────────────────────── */}
        <DemoSection id="chips" title="Chip" description="Filter/category pill — default outline, active fills with the primary gradient.">
          <div className="flex flex-wrap gap-3">
            {CATEGORY_CHIPS.map((label, i) => (
              <Chip key={label} active={i === 0}>
                {label}
              </Chip>
            ))}
          </div>
        </DemoSection>

        {/* ── Footer component ─────────────────────────────────────────── */}
        <div className="mt-10">
          <SiteFooter />
        </div>
      </div>
    </MotionConfig>
  )
}

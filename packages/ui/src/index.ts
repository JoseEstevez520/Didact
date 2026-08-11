/**
 * @didact/ui -- Didact's primitive kit: layers 1-2 of the 3-layer architecture
 * (`specs/education-components/design.md` §2), materialized as a real, general-purpose package
 * instead of staying an abstract diagram layer. `@didact/core` (layer 3, the education molecules)
 * composes its components from these primitives instead of each one inventing its own
 * button/card/toggle/etc. ad hoc -- see `docs/interface-norms.md` for the norms this kit exists to
 * make possible by construction (action hierarchy, card composition, spacing/sizing, focus/state
 * treatment, motion strategy).
 *
 * Every primitive here is a verbatim port of the reference headless-primitives + Tailwind + `cva`
 * kit named in `requirements.md` §0.2: same variant/size sets, same class structure (standard
 * Tailwind utilities reading `@didact/theme`'s CSS custom properties, e.g. `bg-primary`,
 * `text-muted-foreground`), same `data-slot`/`data-variant`/`data-size` attributes, same
 * `asChild`/Slot escape hatch where it applies, and the same unified `radix-ui` package import.
 * See each component file for the specific porting notes.
 *
 * Product-owner decision recorded in `requirements.md` §2 (2026-08-11): this package revisits the
 * original "generic primitives are out of scope" scope line -- Didact now ships its own minimal
 * primitive kit as the base its educational components compose from, for self-contained quality
 * and consistent interface norms, rather than asking every consumer to bring their own.
 */

export { Button, buttonVariants, type ButtonProps } from "./components/button.js";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./components/card.js";

export { Badge, badgeVariants, type BadgeProps } from "./components/badge.js";

export { Separator } from "./components/separator.js";

export { Toggle, toggleVariants } from "./components/toggle.js";

export { ToggleGroup, ToggleGroupItem } from "./components/toggle-group.js";

export { Input } from "./components/input.js";

export { Textarea } from "./components/textarea.js";

export { Label } from "./components/label.js";

export { RadioGroup, RadioGroupItem } from "./components/radio-group.js";

export { Checkbox } from "./components/checkbox.js";

export { cn } from "./lib/cn.js";

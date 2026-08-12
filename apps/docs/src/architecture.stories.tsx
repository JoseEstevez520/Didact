import type { Meta, StoryObj } from "@storybook/react-vite";

function CatalogArchitecture() {
  const layers = [
    ["Foundations", "Visual primitives used by every consumer."],
    ["Learning patterns", "Reusable questions, practice, feedback and orchestration."],
    ["Representation domains", "Language, mathematics, data, space, time, media and symbols."],
    ["Experience platforms", "Animation, simulation, scenarios, code and creative tools."],
    ["Course recipes", "Real configurations for corporate, creative, technical and academic learning."],
  ];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">Didact catalog</p>
        <h1 className="text-3xl font-semibold tracking-tight">One library, from basic courses to specialist learning</h1>
        <p className="max-w-3xl text-muted-foreground">
          Every component has one canonical location. Subject-specific examples configure reusable
          tools instead of duplicating them.
        </p>
      </header>

      <ol className="grid gap-4 md:grid-cols-2">
        {layers.map(([name, description], index) => (
          <li key={name} className="rounded-xl border bg-card p-5 text-card-foreground">
            <p className="text-sm text-muted-foreground">Layer {index + 1}</p>
            <h2 className="mt-1 font-medium">{name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </li>
        ))}
      </ol>

      <section className="space-y-3 border-t pt-6">
        <h2 className="text-xl font-medium">Admission rule</h2>
        <p className="max-w-3xl text-muted-foreground">
          A new public component must introduce a meaningful representation, learner action, data
          model, domain feedback, accessibility contract or stable composition. Otherwise it is a
          variant, recipe or story of an existing component.
        </p>
      </section>
    </main>
  );
}

const meta = {
  title: "00 Start here/Architecture",
  component: CatalogArchitecture,
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta<typeof CatalogArchitecture>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {};

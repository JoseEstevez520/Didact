import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { availableCollections, catalog } from "@didact/catalog";

function text(value: string | Readonly<Record<string, string>>): string {
  if (typeof value === "string") return value;
  return value.en ?? Object.values(value)[0] ?? "Untitled";
}

function unique(values: readonly (readonly string[])[]): string[] {
  return [...new Set(values.flat())].sort();
}

interface CatalogExplorerProps {
  initialCollection?: string;
}

function CatalogExplorer({ initialCollection = "all" }: CatalogExplorerProps) {
  const [query, setQuery] = React.useState("");
  const [role, setRole] = React.useState("all");
  const [family, setFamily] = React.useState("all");
  const [subject, setSubject] = React.useState("all");
  const [representation, setRepresentation] = React.useState("all");
  const [learnerAction, setLearnerAction] = React.useState("all");
  const [purpose, setPurpose] = React.useState("all");
  const [context, setContext] = React.useState("all");
  const [collection, setCollection] = React.useState(initialCollection);
  const [keyboard, setKeyboard] = React.useState("all");
  const [qti, setQti] = React.useState("all");

  const families = unique(catalog.map((manifest) => manifest.families));
  const subjects = unique(catalog.map((manifest) => manifest.facets.subjects));
  const representations = unique(catalog.map((manifest) => manifest.facets.representations));
  const learnerActions = unique(catalog.map((manifest) => manifest.facets.learnerActions));
  const purposes = unique(catalog.map((manifest) => manifest.facets.purposes));
  const contexts = unique(catalog.map((manifest) => manifest.facets.contexts ?? []));
  const selectedCollection = collection === "all"
    ? undefined
    : availableCollections.find(({ slug }) => slug === collection);
  const selectedManifestIds: ReadonlySet<string> = new Set<string>(selectedCollection?.items.map(({ manifestId }) => manifestId) ?? []);
  const normalized = query.trim().toLocaleLowerCase();

  const matches = catalog.filter((manifest) => {
    const searchable = [
      text(manifest.name),
      text(manifest.description),
      ...manifest.families,
      ...manifest.facets.subjects,
      ...manifest.facets.representations,
      ...manifest.facets.learnerActions,
      ...manifest.facets.purposes,
      ...(manifest.tags ?? []),
    ].join(" ").toLocaleLowerCase();
    const qtiMappings = manifest.mappings?.qti
      ? Array.isArray(manifest.mappings.qti) ? manifest.mappings.qti : [manifest.mappings.qti]
      : [];
    return (role === "all" || manifest.role === role)
      && (family === "all" || manifest.families.some((value) => value === family))
      && (subject === "all" || manifest.facets.subjects.some((value) => value === subject))
      && (representation === "all" || manifest.facets.representations.some((value) => value === representation))
      && (learnerAction === "all" || manifest.facets.learnerActions.some((value) => value === learnerAction))
      && (purpose === "all" || manifest.facets.purposes.some((value) => value === purpose))
      && (context === "all" || manifest.facets.contexts?.some((value) => value === context))
      && (collection === "all" || selectedManifestIds.has(manifest.id))
      && (keyboard === "all" || manifest.accessibility.keyboard === keyboard)
      && (qti === "all" || qtiMappings.some((mapping) => mapping.fidelity === qti))
      && (!normalized || searchable.includes(normalized));
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 p-6">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-muted-foreground">Didact catalog</p>
        <h1 className="text-3xl font-semibold tracking-tight">Find by need, subject or interaction</h1>
        <p className="max-w-3xl text-muted-foreground">
          Every component has one canonical implementation. Collections create useful views and downloadable kits without duplicating source.
        </p>
      </header>

      <nav aria-label="Catalog collections" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {availableCollections.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={collection === entry.slug}
            onClick={() => setCollection(collection === entry.slug ? "all" : entry.slug)}
            className="rounded-xl border bg-card p-4 text-left text-card-foreground shadow-sm transition-colors hover:bg-accent aria-pressed:border-primary aria-pressed:bg-accent"
          >
            <span className="font-medium">{text(entry.title)}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{entry.items.length} components</span>
          </button>
        ))}
      </nav>

      {selectedCollection ? (
        <section className="rounded-xl border bg-card p-5 text-card-foreground" aria-labelledby="selected-collection-title">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{selectedCollection.kind} collection</p>
              <h2 id="selected-collection-title" className="mt-1 text-xl font-semibold">{text(selectedCollection.title)}</h2>
            </div>
            <span className="rounded-full border px-2 py-1 text-xs">
              Kit: {selectedCollection.kit?.name ?? "not published"}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{text(selectedCollection.description)}</p>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {selectedCollection.items.map((item) => {
              const manifest = catalog.find(({ id }) => id === item.manifestId);
              return (
                <li key={`${item.manifestId}:${"typeId" in item ? item.typeId : ""}`} className="text-sm">
                  <span className="font-medium">{manifest ? text(manifest.name) : item.manifestId}</span>
                  <span className="text-muted-foreground"> · {item.role} · {item.reason}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">
          Search
          <input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal" placeholder="Quiz, mathematics, feedback…" />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Collection
          <select value={collection} onChange={(event) => setCollection(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All collections</option>
            {availableCollections.map((entry) => <option key={entry.id} value={entry.slug}>{text(entry.title)}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Subject
          <select value={subject} onChange={(event) => setSubject(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All subjects</option>
            {subjects.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Learning purpose
          <select value={purpose} onChange={(event) => setPurpose(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All purposes</option>
            {purposes.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Learning context
          <select value={context} onChange={(event) => setContext(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All contexts</option>
            {contexts.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Representation
          <select value={representation} onChange={(event) => setRepresentation(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All representations</option>
            {representations.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Learner action
          <select value={learnerAction} onChange={(event) => setLearnerAction(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All actions</option>
            {learnerActions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Educational family
          <select value={family} onChange={(event) => setFamily(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All families</option>
            {families.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Technical role
          <select value={role} onChange={(event) => setRole(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All roles</option>
            <option value="interaction">Interaction</option>
            <option value="display">Display</option>
            <option value="composite">Composite</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Keyboard access
          <select value={keyboard} onChange={(event) => setKeyboard(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All levels</option>
            <option value="full">Full</option>
            <option value="alternative">Alternative</option>
            <option value="not-applicable">Not applicable</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          QTI mapping
          <select value={qti} onChange={(event) => setQti(event.currentTarget.value)} className="h-10 rounded-md border bg-background px-3 font-normal">
            <option value="all">All mappings</option>
            <option value="exact">Exact</option>
            <option value="approximate">Approximate</option>
            <option value="none">None</option>
          </select>
        </label>
      </div>

      <p role="status" className="text-sm text-muted-foreground">{matches.length} {matches.length === 1 ? "family" : "families"}</p>

      <ul className="grid gap-4 md:grid-cols-2">
        {matches.map((manifest) => (
          <li key={manifest.id} className="list-none rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{text(manifest.name)}</h2>
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{manifest.role}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{text(manifest.description)}</p>
            <dl className="mt-4 grid gap-2 text-xs">
              <div><dt className="inline font-medium">Subjects: </dt><dd className="inline text-muted-foreground">{manifest.facets.subjects.join(" · ")}</dd></div>
              <div><dt className="inline font-medium">Representation: </dt><dd className="inline text-muted-foreground">{manifest.facets.representations.join(" · ")}</dd></div>
              <div><dt className="inline font-medium">Actions: </dt><dd className="inline text-muted-foreground">{manifest.facets.learnerActions.join(" · ")}</dd></div>
            </dl>
          </li>
        ))}
      </ul>

      {matches.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No families match these filters.</p> : null}
    </main>
  );
}

const meta = {
  title: "00 Start here/Catalog",
  component: CatalogExplorer,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CatalogExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllComponents: Story = {};
export const LearningEssentials: Story = { args: { initialCollection: "learning-essentials" } };
export const MathematicsAndData: Story = { args: { initialCollection: "mathematics-data" } };
export const LanguageLearning: Story = { args: { initialCollection: "language-learning" } };
export const VisualAndSpatial: Story = { args: { initialCollection: "visual-spatial" } };
export const CorporateTraining: Story = { args: { initialCollection: "corporate-training" } };
export const TechnicalTraining: Story = { args: { initialCollection: "technical-training" } };

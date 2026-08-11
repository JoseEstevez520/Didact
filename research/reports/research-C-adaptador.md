# Research C — SkillNet Adapter (requirements.md §6, questions 7 and 8)

Sources read in full: `library/specs/education-components/requirements.md`,
`library/specs/education-components/design.md`,
`repo/docs/design/openui-adoption.md` (in full).
Code sources read: `repo/apps/skillnet-web/src/components/courses/kit/{schemas.ts,library.tsx,index.ts,assertStaticOnly.ts,QuizItemRenderer.tsx}`,
`repo/apps/skillnet-api/src/render/spec.py`.

## Important methodological note: where "the 7 rules of §5.2" actually live

`openui-adoption.md` (the *decision* document) **cites** "the 7 contract rules of §5.2"
more than ten times but **does not enumerate them literally** within itself — it is a
decision document, not the original spec; the `§5.2` numbering it cites belongs to another
document (`docs/design/v2-dynamic-courses.md`, confirmed by grep: that file does have a
`### 5.2 La IR canónica: UISpec` section). The authoritative, executable enumeration of the
7 rules is in the docstring of `repo/apps/skillnet-api/src/render/spec.py:1-26`, which is the
code that implements them. I use it as the primary source because it is what actually runs in
`test_render_kit.py` and `test_render_prompt_artifact.py`:

1. **Rule 1** — `root` exists in `components` and is a container (`Stack` or `Card`).
2. **Rule 2** — every id referenced in `children` exists (forward references are allowed).
3. **Rule 3** — no cycles in the `children` graph.
4. **Rule 4** — max. 12 components per spec, max. 5 children at the root level, max. 64 blocks in the already-expanded tree.
5. **Rule 5** — `QuizItem` carries no correct answer or explanation; that lives in `answer_key` and never travels in the `ui_spec` (`ANSWER_KEY_KEYS` in `spec.py:75-87`: `correct`, `correct_order`, `correct_answer`, `answer`, `answers`, `blanks`, `explanation`, `rubric`, `solution`).
6. **Rule 6** — `props.text` is plain text or inline markup, never HTML.
7. **Rule 7** — in the `explanation` and `mixed` formats, the first child of `root` must be a `TextContent` with `variant="lead"` or a `Callout`.

On top of this, outside the 7 rules but equally binding for "no reactivity"
(`openui-adoption.md` §3 "What is NOT adopted" and §6 "non-negotiable conditions"):
**zero `Mutation`, zero `Query`, zero `$state`, no component may call
`useTriggerAction()`**. Today `RENDER_ALLOW_REACTIVE = False` (cited in `openui-adoption.md`
line ~386). This is what requirements.md §6 calls "§6" when referring to the reactivity
conditions.

I also review the real block catalog in
`kit/schemas.ts` / `kit/library.tsx`: **today there are 14 components**, not 10 as the
`design.md` §5 draft assumes (`Stack, TextContent, Card, Callout, StepSequence, Table, CodeBlock, Chart,
QuizItem, BeforeAfter, Markdown, DragOrder, AudioExplanation, PronunciationExercise` —
`schemas.ts:167-182`). The catalog has grown since the `design.md` draft was written, and
already includes direct precedents for several rows the draft marked "to confirm".

---

## Question 7 — Which components from the §4.1 inventory can be expressed without reactivity?

Key pattern observed in the real code: a kit block can have **pure React internal
state** (e.g. `QuizItemBlock` is "self-contained: its own state and its own submission to
`POST /nodes/{id}/answer`" — `QuizItemRenderer.tsx:16-19`) without violating "no reactivity",
because that prohibition is about the **OpenUI dialect layer** (`$state`, `Mutation`, `Query`,
`useTriggerAction`), not about ordinary `useState`/`useEffect` inside the React component that
renders the block. This is the key to classifying Flashcard, Hint/Reveal, DragOrder, and Rubric
as APT despite having visible interactivity.

| Component (RF) | Verdict | Reason, with concrete rule |
|---|---|---|
| **Flashcard** (RF-1) | **APT** | Front/back/flip/mark-as-known are ephemeral internal React state, not DSL. Does not use `Mutation`/`Query`/`$state` (§3/§6 prohibition, not one of the 7 rules). There is no `answer_key` to protect (rule 5 does not apply: it is not a graded item). Direct precedent: `QuizItemBlock` already combines static props + autonomous internal state (`QuizItemRenderer.tsx:16-19`). |
| **SpacedRepetitionDeck** (RF-2) | **NOT APT** | Needs to persist/read review state across sessions (which card is due, next date) — that requires a real `Query`/`Mutation`, prohibited without exception today (`openui-adoption.md` §3 "The reactive layer is switched off"; `RENDER_ALLOW_REACTIVE = False`). This is not a problem with the 7 rules of `spec.py`, it is the prior prohibition on reactivity that those rules depend on. Matches requirements.md §2 ("Out of scope: Mutation/Query/$state-type reactivity"). |
| **MatchingExercise / SortExercise / CategorizeExercise** (RF-3) | **APT** | Precedent already built and in production: `DragOrder` (`schemas.ts:150-154`, `library.tsx:254-265`) declares `instruction`, `items`, `correctOrder` as **literal** props and resolves checking with internal React, without `Mutation`. Complies with rule 6 (plain text) and rule 4 (size). The `design.md` draft said "to confirm"; the confirmation with code evidence is that **it is already resolved for the ordering case**; matching/categorizing would follow the same literal-props pattern. |
| **Quiz variants** (multi-answer, T/F, fill-in-the-blank, short open answer) (RF-4) | **APT** | `QuizItem` already covers exactly this space: `item_type` has 6 values (`test, true_false, fill_blank, order_steps, practical_case, dialogue`, `schemas.ts:48-55`), with no `correct`/`explanation` in the prop schema (rule 5, `quizItemProps` in `schemas.ts:130-136`: explicit comment "No `correct` and no `explanation`: contract rule 5"). Assisted verification of short open answers already runs server-side via `POST /nodes/{id}/answer` (autonomous, not a dialect `Mutation`). |
| **Glossary / Term** (RF-5) | **APT** | Pure presentation (tooltip/popover over text), with no answer to protect (rule 5 does not apply) and no embedded HTML if the content is text/inline markup (rule 6). No dynamic data or query of any kind. |
| **Hint / Reveal** (RF-6) | **APT, with a structural tension the `design.md` draft does not flag** | Show/hide is internal React state (like the `DragOrder`/`QuizItemBlock` toggle), not dialect reactivity. BUT: the "canonical re-serialization" model (`openui-adoption.md` "The most important architectural rule", line ~262) implies that **the entire `ui_spec`, including hidden content, is served in one shot** when rendering the node — there is no second request to the server to ask for the hint. If the content to reveal is normal pedagogical information (a hint, an ungraded explanation), it is acceptable for it to travel in the prop and only be hidden via CSS/state until the user requests it — just like a `<details>` element. But if what is being "revealed" is the correct answer to a `QuizItem`, that **does** collide with rule 5 (must never be in the `ui_spec`) and would have to be resolved by revealing it via the same autonomous POST that `QuizItem` already uses, not as a prop of the `Hint/Reveal` block itself. RF-6 as written in requirements.md ("must not leak the correct answer in the DOM until the user explicitly requests it") is, therefore, **only compatible without reactivity if "Hint/Reveal" never wraps an exam answer** — that boundary must be documented in the adapter. |
| **Progress / mastery** (RF-7) | **APT** | An indicator that paints a fixed snapshot (e.g. `mastery: 0.72` at generation time) is a literal prop, exactly as `Chart` already does with `values: number[]` (`schemas.ts:118-123`, no `Query`). It is not a bar that updates live — that would indeed require `Query`, which is prohibited. |
| **Timeline / Steps** (RF-8) | **APT** | Already exists literally: `StepSequence` (`schemas.ts:103-106`, `library.tsx:160-170`) is `title` + `steps: string[]`, both literal. 1:1 match with RF-8, not an analogy. |
| **Video checkpoint** (RF-9) | **APT in principle / blocked in practice** | Nothing in the 7 rules or in the reactivity prohibition prevents declaring `videoUrl`, `timestampSeconds`, `question` as literal props and resolving the pause/question with the block's own internal React state (same autonomous pattern as `QuizItemBlock`) — just as the checkpoint does not need a dialect `Mutation`/`Query` to work. The real blocker is infrastructural, not rule-based: **there is no video player chosen in `skillnet-web`** (see Question 8), so there is nothing to wire `onTimeUpdate`/pause against. This is exactly the double condition the `design.md` draft already anticipated ("to confirm, depends on the player"), and here I confirm it by separating the two questions: dialect reactivity = not the problem; player = it is. |
| **Rubric / self-assessment** (RF-10) | **APT** | A checklist of criteria with levels and no automatic grade (by definition of RF-10, "no automatic grade if the criterion is subjective") means there is no `answer_key` to protect (rule 5 does not apply: there is no secret correct answer, it is self-assessment). Selection state is ephemeral, as in `Hint/Reveal`. Structurally it is a `Table`/`StepSequence` with a per-row selection control. |
| **Code exercise** (RF-11) | **NOT APT** | "Checking" implies executing or at least validating code against a result — that requires a network call equivalent to a `Mutation` (prohibited without exception today) or a client-side execution runtime well beyond the scope of a static declarative block, and outside the security model of `gate.py`/`assertStaticOnly.ts` (designed for nodes without side effects). Code *display* without checking already exists (`CodeBlock`, `schemas.ts:113-116`) and that subset is indeed APT, but it does not cover the full RF-11 requirement. Matches the `design.md` draft ("Probably not, needs execution"). |

### Comparison with the `design.md` §5 draft — discrepancies found

1. **RF-3 (matching/sort/categorize)**: the draft said "To confirm". With code evidence
   this can be upgraded to **confirmed APT** — `DragOrder` is already a production component
   with exactly that pattern (literal props, no `Mutation`).
2. **RF-8 (Timeline)**: the draft gave a generic "Yes"; in reality it already exists
   literally as `StepSequence` in the catalog — there would be no need to "create it", just
   map the core component to the already-registered block (or replace it).
3. **RF-6 (Hint/Reveal)**: the draft correctly notes the necessary care ("careful
   not to leak the answer"), but does not make explicit that the architectural model of "a
   single canonical re-serialization served at once" (no second request) makes that caution
   structural and not merely an implementation detail: any "Hint/Reveal" that wraps an exam
   answer has to delegate to the same autonomous server channel as `QuizItem`, not carry the
   secret as its own prop.
4. **RF-9 (video checkpoint)**: the draft marks it "to confirm (depends on the
   player)" as a single question. Here I split the question into two: compatibility with
   "no reactivity" is **not** the obstacle (it is expressible with the same autonomous pattern
   as `QuizItem`/`DragOrder`); the real obstacle and the only pending item is the absence of a
   player (Question 8).
5. The draft counts "10 current blocks"; the real catalog in `schemas.ts`/`library.tsx` has
   **14** (`BeforeAfter`, `DragOrder`, `AudioExplanation`, `PronunciationExercise` were added
   since the draft was written). This does not change any verdict, but it does change the
   base of available precedents to justify APT for RF-1, RF-3, and RF-8.

### Explicit recommendation — Question 7

Of the 11 components in the inventory, **8 are APT** for the v2 generative catalog without
touching the reactive layer (Flashcard, Matching/Sort/Categorize, quiz variants,
Glossary/Term, Hint/Reveal, progress/mastery, Timeline/Steps, Rubric), **1 is APT in principle
but blocked by infrastructure** (video checkpoint, RF-9 — see Question 8), and **2 are NOT APT
while `RENDER_ALLOW_REACTIVE` remains `False`** (SpacedRepetitionDeck, code exercise).
For the SkillNet adapter, prioritize registration in this order: first the ones that already
have a 1:1 precedent in the current kit (Timeline via `StepSequence`, Matching/Sort via
`DragOrder`, quiz variants via `QuizItem`), then the new ones with no direct precedent but no
rule friction (Flashcard, Glossary, progress/mastery, Rubric), and leave Hint/Reveal for when
the adapter explicitly documents the boundary "never wraps an exam answer".

---

## Question 8 — Is there already a video player integrated in `skillnet-web` that supports checkpoints?

Search executed over `repo/apps/skillnet-web/` (with cross-checking in
`repo/apps/skillnet-api/src`) with Grep and Glob for: `video`, `player`, `react-player`,
`ReactPlayer`, `video.js`/`videojs`, `hls`/`hls.js`, `mux`, `vimeo`, `youtube`, `<video`, `Plyr`,
and for checkpoint event terms: `onTimeUpdate`, `currentTime`, `timeupdate`,
`checkpoint`, `cue`, `seek`.

**Result: no video player integration was found in `skillnet-web`.**
Zero matches in source code, zero files with "video" or "player" in the name, and zero
mentions of timestamp/checkpoint events anywhere in the `src/` tree. There is also nothing in
`skillnet-api`.

The only real multimedia dependency in the project is `wavesurfer.js` (`^7.12.11`) in
`apps/skillnet-web/package.json`, which is for **audio** (waveform visualization) — it is
the basis for `AudioExplanationBlock`/`PronunciationExerciseBlock`, not for video. It is,
however, a useful precedent: it shows that the project **does** accept a focused external
dependency with a pinned version when the kit needs it (consistent with RNF-5 of
`requirements.md`: "exact version and drift test").

### What would need to be evaluated from scratch (no prior decision to reuse)

1. **Video source type**: self-hosted video (mp4/HLS) or third-party embed
   (YouTube/Vimeo)? This determines everything that follows — a YouTube/Vimeo `<iframe>`
   only exposes time events via its JS SDK (`postMessage`/IFrame API), with less fine-grained
   control than a native element.
2. **Native `<video>` + `timeupdate`/`TextTrack` Web API (`<track kind="chapters">`, `cues`)**:
   this is the lowest-dependency option (zero new package), consistent with the
   minimal-dependency philosophy already seen in the kit (only `wavesurfer.js` for audio). It
   supports timing-based checkpoints with native DOM events, no library.
3. **`react-player`**: a common wrapper to unify mp4/YouTube/Vimeo under one API, but it is an
   additional npm dependency (with its own risk of a minor version breaking things, the same
   risk pattern that motivated rejecting keeping `@openuidev` without a drift test) — it would
   need the same exact-version + drift-test treatment that RNF-5 requires.
4. **`video.js` / `hls.js` / Mux**: relevant only if there is a real need for adaptive
   streaming (HLS) — there is no evidence in the repo that SkillNet serves video over HLS
   today; evaluating it without that confirmed requirement first would be over-engineering.
5. **Accessibility**: subtitles/transcript (relevant for core RF-12/RF-14,
   neurodiversity, and time control) — whichever option is chosen must support `<track>`
   WebVTT or equivalent, not wave it off as "to add later".
6. **Fit with the "no reactivity" model from Question 7**: the checkpoint itself (pausing,
   showing the question) is resolved with the block's autonomous React state, not with the
   OpenUI dialect — so the choice of player does not reopen `openui-adoption.md`, it is an
   ordinary UI dependency decision for the core or the adapter, subject to RNF-5.

### Explicit recommendation — Question 8

Do not invent a video integration at this research stage: **it does not exist today in
`skillnet-web`, it needs to be evaluated from scratch**, and there is no evidence in the repo
of what type of video source SkillNet uses or would use (self-hosted vs. YouTube/Vimeo), a
fact that is needed before choosing. Recommended starting point for the technical
investigation (not decided here): try native `<video>` + `<track kind="chapters">`/`timeupdate`
events first as the zero-dependency-cost option, and only move up to `react-player` or
another library if a concrete requirement appears (e.g. videos already hosted on
YouTube/Vimeo) that the native element cannot cover.

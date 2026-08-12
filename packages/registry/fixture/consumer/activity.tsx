import { HintReveal } from "@/components/didact/hint-reveal";

export function CourseActivity() {
  return (
    <main>
      <h1>Practice: HTTP caching</h1>
      <HintReveal
        heading="Why can a browser reuse this response?"
        description="Use the clues before revealing the explanation."
        hints={["Inspect the Cache-Control header.", "Look for max-age."]}
        solution="The response is still fresh because its max-age has not elapsed."
      />
    </main>
  );
}

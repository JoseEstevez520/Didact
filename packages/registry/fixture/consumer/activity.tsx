import { HintReveal } from "@/components/didact/hint-reveal";
import { MeasurementLab } from "@/components/didact/measurement-lab";
import { WordBank } from "@/components/didact/word-bank";

export function CourseActivity() {
  return (
    <main className="course-shell">
      <h1>Didact consumer smoke test</h1>

      <HintReveal
        heading="Why can a browser reuse this response?"
        description="Use the clues before revealing the explanation."
        hints={["Inspect Cache-Control.", "Look for max-age."]}
        solution="The response is still fresh because its max-age has not elapsed."
      />

      <WordBank
        title="Complete the cache rule"
        gaps={[{
          id: "freshness",
          before: "A response remains fresh for",
          after: ".",
          correctOptionIds: ["max-age"],
        }]}
        options={[
          { id: "max-age", content: "max-age seconds" },
          { id: "etag", content: "the ETag value" },
        ]}
      />

      <MeasurementLab
        definition={{
          id: "pressure",
          title: "Read the pressure gauge",
          observedReading: 116,
          instrument: {
            kind: "dial",
            min: 0,
            max: 160,
            step: 2,
            majorStep: 20,
            unit: "kPa",
          },
        }}
      />
    </main>
  );
}

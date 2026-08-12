import type { Meta, StoryObj } from "@storybook/react-vite";

import { MediaPlayer } from "./media-player.js";

const meta: Meta<typeof MediaPlayer> = {
  title: "01 Foundations/Media/Media Player",
  component: MediaPlayer,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[min(44rem,90vw)] overflow-hidden rounded-xl border"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const AudioOnly: Story = { args: { kind: "audio", src: "didact-demo://audio", durationMs: 52_000 } };
export const VideoOnly: Story = { args: { kind: "video", src: "didact-demo://video", durationMs: 138_000, poster: "" } };
export const Disabled: Story = { args: { kind: "audio", src: "didact-demo://audio", durationMs: 52_000, disabled: true } };

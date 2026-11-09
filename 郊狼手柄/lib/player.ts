import type { Channel } from "../shared/types.ts";

export type Wave = { id: string; name: string; frames: string[] };
const CHANNELS: Channel[] = ["A", "B"];

/**
 * 波形流：抄自 coyote-link-studio/server/controller.ts 的脉冲循环。
 * 单次最多 5 帧、每帧 100ms，必须持续喂，cursor 循环播放。
 */
export class Player {
  private device: any;
  private onFault: (message: string) => void;
  private wave: Record<Channel, Wave | null> = { A: null, B: null };
  private cursor: Record<Channel, number> = { A: 0, B: 0 };
  private nextAt: Record<Channel, number> = { A: 0, B: 0 };
  private busy: Record<Channel, boolean> = { A: false, B: false };

  constructor(device: any, onFault: (message: string) => void) {
    this.device = device;
    this.onFault = onFault;
  }

  waveform(channel: Channel): Wave | null {
    return this.wave[channel];
  }

  setWaveform(channel: Channel, wave: Wave | null) {
    if (!CHANNELS.includes(channel)) throw new Error("通道不存在");
    if (this.wave[channel]?.id !== wave?.id) this.cursor[channel] = 0;
    this.wave[channel] = wave;
  }

  reset() {
    for (const channel of CHANNELS) {
      this.wave[channel] = null;
      this.cursor[channel] = 0;
      this.nextAt[channel] = 0;
    }
  }

  tick(now: number) {
    if (!this.device.state.connected) return;
    for (const channel of CHANNELS) {
      const wave = this.wave[channel];
      if (!wave || wave.frames.length === 0) continue;
      if (this.busy[channel] || now < this.nextAt[channel]) continue;
      const count = 3;
      const frames = Array.from(
        { length: count },
        (_, i) => wave.frames[(this.cursor[channel] + i) % wave.frames.length],
      );
      this.cursor[channel] = (this.cursor[channel] + count) % wave.frames.length;
      this.nextAt[channel] = now + count * 100;
      this.busy[channel] = true;
      this.device
        .sendFrames(channel, frames)
        .catch((error: unknown) => {
          this.onFault(
            `${channel} 通道波形发送失败：${error instanceof Error ? error.message : String(error)}`,
          );
        })
        .finally(() => {
          this.busy[channel] = false;
        });
    }
  }
}

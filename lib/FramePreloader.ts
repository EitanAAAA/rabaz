export class FramePreloader {
  constructor(
    private readonly frameCount: number,
    private readonly resolvePath: (index: number) => string,
    private readonly onProgress: (percent: number) => void
  ) {}

  async load(signal: AbortSignal): Promise<HTMLImageElement[]> {
    const images: HTMLImageElement[] = new Array(this.frameCount);
    const priorityIndexes = this.buildPriorityOrder();
    let loaded = 0;

    const report = () => {
      this.onProgress(Math.min(100, Math.round((loaded / this.frameCount) * 100)));
    };

    const batchSize = 12;

    for (let start = 0; start < priorityIndexes.length; start += batchSize) {
      if (signal.aborted) return images;

      const slice = priorityIndexes.slice(start, start + batchSize);
      const batch = await Promise.all(slice.map((frameNumber) => this.loadImage(frameNumber, signal)));

      slice.forEach((frameNumber, offset) => {
        const slot = frameNumber - 1;
        images[slot] = batch[offset];
        if (batch[offset].naturalWidth > 0) loaded += 1;
      });

      report();
    }

    this.onProgress(100);
    return images;
  }

  private buildPriorityOrder() {
    const order: number[] = [];
    const tailStart = Math.max(1, this.frameCount - 80);

    for (let frame = tailStart; frame <= this.frameCount; frame += 1) {
      order.push(frame);
    }

    for (let frame = 1; frame <= this.frameCount; frame += 1) {
      if (!order.includes(frame)) order.push(frame);
    }

    return order;
  }

  private loadImage(frameIndex: number, signal: AbortSignal, attempt = 0): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      if (signal.aborted) {
        resolve(new Image());
        return;
      }

      const image = new Image();
      image.decoding = "async";

      const finish = (success: boolean) => {
        window.clearTimeout(timeoutId);
        if (success || attempt >= 2) {
          resolve(image);
          return;
        }
        void this.loadImage(frameIndex, signal, attempt + 1).then(resolve);
      };

      const timeoutId = window.setTimeout(() => finish(false), 20000);
      image.onload = () => finish(image.naturalWidth > 0);
      image.onerror = () => finish(false);
      image.src = this.resolvePath(frameIndex);
    });
  }
}

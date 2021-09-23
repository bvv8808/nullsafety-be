import { TContent, TContentPreview } from "./types";

export interface IResMain1 {
  cntToday: number;
  cntTotal: number;
  contentPreviewsByHit: TContentPreview[];
  contentPreviewsByLike: TContentPreview[];
}

export interface IResContent2 {
  contentData: TContent;
  prevContentPreview?: TContentPreview;
  nextContentPreview?: TContentPreview;
}

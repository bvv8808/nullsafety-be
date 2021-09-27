import {
  TCntContents,
  TCntLike,
  TContent,
  TContentPreview,
  TVisitor,
} from "./types";

export interface IResMain1 {
  cntToday: number;
  cntTotal: number;
  contentPreviewsByHit: TContentPreview[];
  contentPreviewsByLike: TContentPreview[];
}

export interface IResDash {
  cntVisitor: TVisitor;
  cntContents: TCntContents;
  cntLike: TCntLike;
}

export interface IResContent2 {
  contentData: TContent;
  prevContentPreview?: TContentPreview;
  nextContentPreview?: TContentPreview;
}

export interface IResCode {
  code: number;
  msg: string;
}

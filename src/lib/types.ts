export type TContentPreview = {
  idx: number;
  title: string;
  category: string;
  thumbnail: string;
  createdAt: string;
};

export type TContent = {
  idx: number;
  title: string;
  category: string;
  createdAt: string;
  content: string;
};

export type TCntContents = {
  total: number;
  perCategory: [string, number][];
};

export type TCntLike = TCntContents;

export type TCategoryDetail = {
  idx: number;
  name: string;
  priority: number;
};

export type TVisitor = {
  total: number;
  today: number;
  months: [string, number][];
};

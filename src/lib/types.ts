export type TContentPreview = {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  createdAt: string;
};

export type TContent = {
  id: number;
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
  id: number;
  name: string;
  priority: number;
};

export type TVisitor = {
  total: number;
  today: number;
  months: [string, number][];
};

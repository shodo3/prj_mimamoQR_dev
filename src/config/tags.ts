export type TagConfig = {
  publicTagId: string;
  enabled: boolean;
};

/**
 * MVP: 管理UIは作らず、ここで公開IDを管理する。
 * - 個人情報（氏名など）を絶対に入れないこと
 * - publicTagId はランダム文字列のみ
 */
export const TAGS: TagConfig[] = [
  {
    publicTagId: "tag_7f2c9d4a1b8e",
    enabled: true,
  },
];

export function getTagConfig(publicTagId: string): TagConfig | null {
  const found = TAGS.find((t) => t.publicTagId === publicTagId);
  if (!found || !found.enabled) return null;
  return found;
}


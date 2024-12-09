export const tournType = {
  unofficial: 0,
  official: 1,
} as const;
export type TournType = (typeof tournType)[keyof typeof tournType];

const tournTypeLabel = {
  0: '非公式',
  1: '公式',
} as const;

export const getTournTypeLabel = (tournType: TournType) => {
  return tournTypeLabel[tournType];
};

export const officialType = {
  unofficial: 0,
  official: 1,
} as const;
export type OfficialType = (typeof officialType)[keyof typeof officialType];

const officialTypeLabel = {
  0: '非公式',
  1: '公式',
} as const;
export const getOfficialTypeLabel = (officialType: OfficialType) => {
  return officialTypeLabel[officialType];
};

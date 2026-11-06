// Camera and Photo Strip Filter Definitions

export type CameraFilter = "original" | "bw" | "film" | "fisheye";

export interface FilterDefinition {
  id: CameraFilter;
  label: string;
  cssFilter: string;
}

export const CAMERA_FILTERS: FilterDefinition[] = [
  {
    id: "original",
    label: "Original",
    cssFilter: "none",
  },
  {
    id: "bw",
    label: "Black & White",
    cssFilter: "grayscale(100%) contrast(120%) brightness(104%)",
  },
  {
    id: "film",
    label: "Film",
    cssFilter: "contrast(115%) brightness(105%) saturate(125%) sepia(22%) hue-rotate(-8deg)",
  },
  {
    id: "fisheye",
    label: "Fisheye 🐟",
    cssFilter: "none", // Rendered with real-time WebGL barrel distortion
  },
];

export function getFilterCss(filterId: CameraFilter | string): string {
  const match = CAMERA_FILTERS.find((f) => f.id === filterId);
  if (match) return match.cssFilter;
  if (filterId === "normal") return "none";
  if (filterId === "sepia") return "sepia(75%) contrast(105%) brightness(98%)";
  if (filterId === "vintage") return "contrast(115%) brightness(105%) saturate(125%) sepia(22%) hue-rotate(-8deg)";
  return "none";
}

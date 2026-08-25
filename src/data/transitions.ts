/**
 * Animation data separated from product data (per spec: PRODUCT DATA vs ANIMATION DATA).
 * Lets us add future outfits without rewriting the engine.
 */
export type OutfitTransition = {
  from: string; // outfit id
  to: string;
  // normalized timeline within segment 0..1 (maps to spec: 0.00 hero, 0.08 push, etc)
  reachStart: number; // hand reaches collar
  openStart: number;   // garment opens
  sleeveRemoveStart: number;
  leaveStart: number;
  leaveEnd: number; // garment leaves body
  exposedEnd: number; // torso briefly visible
  appearStart: number; // new garment behind
  shoulderAlign: number;
  sleeveSettle: number;
  collarSettle: number;
  fullyWorn: number;
  heroPose: number;
};

export const transitions: OutfitTransition[] = [
  {
    from: "shirt-01",
    to: "shirt-02",
    reachStart: 0.10,
    openStart: 0.22,
    sleeveRemoveStart: 0.30,
    leaveStart: 0.40,
    leaveEnd: 0.48,
    exposedEnd: 0.54,
    appearStart: 0.48,
    shoulderAlign: 0.62,
    sleeveSettle: 0.70,
    collarSettle: 0.80,
    fullyWorn: 0.88,
    heroPose: 0.95,
  },
  {
    from: "shirt-02",
    to: "jacket-03",
    reachStart: 0.10,
    openStart: 0.22,
    sleeveRemoveStart: 0.30,
    leaveStart: 0.40,
    leaveEnd: 0.48,
    exposedEnd: 0.54,
    appearStart: 0.48,
    shoulderAlign: 0.62,
    sleeveSettle: 0.70,
    collarSettle: 0.80,
    fullyWorn: 0.88,
    heroPose: 0.95,
  },
  {
    from: "jacket-03",
    to: "suit-final",
    reachStart: 0.10,
    openStart: 0.22,
    sleeveRemoveStart: 0.30,
    leaveStart: 0.40,
    leaveEnd: 0.48,
    exposedEnd: 0.54,
    appearStart: 0.48,
    shoulderAlign: 0.62,
    sleeveSettle: 0.70,
    collarSettle: 0.80,
    fullyWorn: 0.88,
    heroPose: 0.95,
  },
];

export function getTransition(from: string, to: string) {
  return transitions.find((t) => t.from === from && t.to === to) ?? transitions[0];
}

// Delta City OS — Quests

export const FIXED_QUESTS = [
  {
    id: 'quest-markets-3',
    title: 'Market Explorer',
    description: 'Visit 3 verified local markets in Warri',
    type: 'visit_markets',
    target: 3,
    reward: {
      badge: 'Market Explorer',
      discount: '5% off at any verified vendor'
    },
    icon: '🛒',
    active: true
  },
  {
    id: 'quest-corridor',
    title: 'Street Keeper Ally',
    description: 'Pass through the active sweeping corridor while Street Keepers are on duty',
    type: 'pass_corridor',
    target: 1,
    reward: {
      badge: 'Street Ally',
      discount: null
    },
    icon: '🧹',
    active: true
  },
  {
    id: 'quest-byka',
    title: 'Green Mover',
    description: 'Spot 2 BYKA riders on the map',
    type: 'spot_byka',
    target: 2,
    reward: {
      badge: 'Green Mover',
      discount: null
    },
    icon: '🚲',
    active: true
  }
];

export function buildPromoQuests(activePromos = []) {
  return activePromos.map(promo => ({
    id: `promo-quest-${promo.id}`,
    title: promo.title,
    description: `${promo.merchantName} · ${promo.marketId}`,
    type: 'claim_promo',
    target: 1,
    reward: {
      badge: null,
      discount: promo.discountLabel,
      promoId: promo.id
    },
    icon: '🏷️',
    active: true,
    promo
  }));
}

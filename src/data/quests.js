// Delta City OS — Starter Quests (Session 6)
// These are the first exploration challenges for citizens in Warri

export const QUESTS = [
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

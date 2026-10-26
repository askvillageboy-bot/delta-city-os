// Delta City OS — Civic Quests & dumpster points (Session 9)
// Light civic actions so citizens help keep the city clean

export const CIVIC_QUESTS = [
  {
    id: 'civic-report-dumpster',
    title: 'Keep Warri Clean',
    description: 'Report a full or overflowing dumpster near you',
    type: 'report_dumpster',
    target: 1,
    reward: {
      badge: 'Clean Citizen',
      points: 10
    },
    icon: '🗑️',
    active: true
  },
  {
    id: 'civic-confirm-corridor',
    title: 'Corridor Watch',
    description: 'Confirm that a sweeping corridor looks clean today',
    type: 'confirm_corridor',
    target: 1,
    reward: {
      badge: 'Street Ally+',
      points: 15
    },
    icon: '✨',
    active: true
  }
];

// Sample dumpster locations in Warri (approximate — for demo markers)
export const DUMPSTERS = [
  {
    id: 'dump-1',
    name: 'Igbudu Road Dumpster',
    status: 'full',
    coordinates: [5.7465, 5.5135]
  },
  {
    id: 'dump-2',
    name: 'Sapele Road Bin Point',
    status: 'ok',
    coordinates: [5.7520, 5.5175]
  },
  {
    id: 'dump-3',
    name: 'Okere Junction Dumpster',
    status: 'full',
    coordinates: [5.7495, 5.5190]
  }
];

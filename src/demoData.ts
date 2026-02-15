import { FoundryBase, ProjectData } from './types';

const mk = (name: string, type: string, system: Record<string, unknown>): FoundryBase => ({
  _id: crypto.randomUUID(),
  name,
  type,
  img: 'icons/svg/book.svg',
  flags: { core: { sourceId: `demo.${name}` } },
  system
});

export function makeDemoProject(): ProjectData {
  return {
    id: crypto.randomUUID(),
    name: 'Demo Campaign',
    updatedAt: Date.now(),
    tags: ['demo', 'dnd5e'],
    actors: [
      mk('Aria Stormwatch', 'character', {
        details: { level: 4, alignment: 'lg' },
        abilities: { str: { value: 10 }, dex: { value: 18 }, con: { value: 14 }, int: { value: 12 }, wis: { value: 13 }, cha: { value: 16 } },
        attributes: { ac: { value: 16 }, hp: { value: 32, max: 32 }, movement: { walk: 30 } },
        skills: { acr: { value: 1 }, ste: { value: 2 } }
      }),
      mk('Ogre Brute', 'npc', {
        details: { cr: 2, type: 'giant', alignment: 'ce' },
        abilities: { str: { value: 19 }, dex: { value: 8 }, con: { value: 16 }, int: { value: 5 }, wis: { value: 7 }, cha: { value: 7 } },
        attributes: { ac: { value: 11 }, hp: { value: 59, max: 59 }, movement: { walk: 40 } },
        traits: { di: { value: ['poison'] } }
      })
    ],
    items: [
      mk('Longsword +1', 'weapon', { damage: { parts: [['1d8+1', 'slashing']] }, proficient: true, weight: 3, price: 500 }),
      mk('Chain Mail', 'equipment', { armor: { value: 16 }, stealth: true, weight: 55 }),
      mk('Potion of Healing', 'consumable', { uses: { value: 1, max: 1 }, formula: '2d4+2' }),
      mk('Thieves\' Tools', 'tool', { proficient: 1, weight: 1 }),
      mk('Adventurer Pack', 'backpack', { capacity: { value: 30 }, weight: 25 })
    ],
    spells: [
      mk('Magic Missile', 'spell', { level: 1, school: 'evo', activation: { type: 'action' }, range: { value: 120 }, duration: { units: 'inst' } }),
      mk('Shield', 'spell', { level: 1, school: 'abj', activation: { type: 'reaction' }, duration: { units: 'round', value: 1 } }),
      mk('Fireball', 'spell', { level: 3, school: 'evo', damage: { parts: [['8d6', 'fire']] }, target: { type: 'sphere', value: 20 } }),
      mk('Bless', 'spell', { level: 1, school: 'enc', concentration: true, duration: { value: 1, units: 'minute' } }),
      mk('Misty Step', 'spell', { level: 2, school: 'con', activation: { type: 'bonus' }, range: { value: 30 } })
    ],
    effects: [
      mk('Poisoned', 'effect', { disabled: false, duration: { rounds: 10 }, changes: [{ key: 'system.bonuses.abilities.save', mode: 2, value: '-2', priority: 20 }] }),
      mk('Blessed', 'effect', { disabled: false, changes: [{ key: 'system.bonuses.abilities.check', mode: 2, value: '1d4', priority: 20 }] }),
      mk('Hasted', 'effect', { disabled: false, changes: [{ key: 'system.attributes.movement.walk', mode: 2, value: '+30', priority: 20 }] })
    ],
    journal: [mk('Session 1 Notes', 'entry', { content: '<p>Party arrived in Neverwinter.</p>', tags: ['session'] })],
    tables: [mk('Random Loot', 'table', { formula: '1d6', results: [{ text: '10gp', weight: 3 }, { text: 'Potion', weight: 1 }] })],
    versions: []
  };
}

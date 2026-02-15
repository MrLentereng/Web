# UI → JSON mapping (основные поля)

| UI поле | JSON путь |
|---|---|
| Actor Name | `actor.name` |
| Actor Type (character/npc) | `actor.type` |
| STR/DEX/CON/INT/WIS/CHA | `actor.system.abilities.<key>.value` |
| AC | `actor.system.attributes.ac.value` |
| HP | `actor.system.attributes.hp.value` |
| Speed | `actor.system.attributes.movement.walk` |
| Skills modal values | `actor.system.skills.<skill>.value` |
| Damage resistances | `actor.system.traits.dr.value[]` |
| Senses modal | `actor.system.attributes.senses.<sense>` |
| Legendary Resistances | `actor.system.resources.legres.value` |
| Lair toggle | `actor.system.lair.enabled` |
| Item price/weight | `item.system.price`, `item.system.weight` |
| Weapon damage | `item.system.damage.parts` |
| Weapon range | `item.system.range.value` |
| Spell level/school | `item(type=spell).system.level`, `.school` |
| Spell concentration | `item(type=spell).system.concentration` |
| Effect enabled | `effect.system.disabled` (inverted UI) |
| Effect duration rounds | `effect.system.duration.rounds` |
| Effect changes | `effect.system.changes[]` |
| Journal content | `journal.system.content` |
| Table results | `table.system.results[]` |
| Raw JSON editor | полный объект (`flags`, неизвестные `system.*`, custom keys) |


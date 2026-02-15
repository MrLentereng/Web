import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { getProjects, putProject } from './db';
import { makeDemoProject } from './demoData';
import { CollectionType, FoundryBase, ProjectData, SidebarSection } from './types';

const sections: SidebarSection[] = ['dashboard', 'actors', 'monsters', 'pcs', 'items', 'spells', 'effects', 'journal', 'tables', 'settings'];
const abilityKeys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const allSkills = ['acr', 'ani', 'arc', 'ath', 'dec', 'his', 'ins', 'itm', 'inv', 'med', 'nat', 'prc', 'prf', 'per', 'rel', 'slt', 'ste', 'sur'];

const emptyByCollection: Record<CollectionType, () => FoundryBase> = {
  actors: () => ({ _id: crypto.randomUUID(), name: 'New Actor', type: 'npc', img: '', flags: {}, system: { abilities: {}, attributes: {}, skills: {} } }),
  items: () => ({ _id: crypto.randomUUID(), name: 'New Item', type: 'loot', img: '', flags: {}, system: {} }),
  spells: () => ({ _id: crypto.randomUUID(), name: 'New Spell', type: 'spell', img: '', flags: {}, system: { level: 0, school: 'abj' } }),
  effects: () => ({ _id: crypto.randomUUID(), name: 'New Effect', type: 'effect', img: '', flags: {}, system: { disabled: false, duration: {}, changes: [] } }),
  journal: () => ({ _id: crypto.randomUUID(), name: 'New Note', type: 'entry', img: '', flags: {}, system: { content: '' } }),
  tables: () => ({ _id: crypto.randomUUID(), name: 'New Table', type: 'table', img: '', flags: {}, system: { results: [] } })
};

const sectionToCollection = (section: SidebarSection): CollectionType | null => {
  if (section === 'pcs' || section === 'monsters' || section === 'actors') return 'actors';
  if (section === 'items' || section === 'spells' || section === 'effects' || section === 'journal' || section === 'tables') return section;
  return null;
};

const jsonPretty = (v: unknown) => JSON.stringify(v, null, 2);

export function App() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [section, setSection] = useState<SidebarSection>('dashboard');
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [modal, setModal] = useState<'skills' | 'resistance' | 'senses' | null>(null);

  useEffect(() => {
    (async () => {
      const loaded = await getProjects();
      if (!loaded.length) {
        const demo = makeDemoProject();
        await putProject(demo);
        setProjects([demo]);
        setActiveProjectId(demo.id);
      } else {
        setProjects(loaded);
        setActiveProjectId(loaded[0].id);
      }
    })();
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activeCollection = sectionToCollection(section);

  const entities = useMemo(() => {
    if (!activeProject || !activeCollection) return [];
    const list = activeProject[activeCollection] as FoundryBase[];
    return list.filter((e) => {
      if (section === 'pcs') return e.type === 'character';
      if (section === 'monsters') return e.type === 'npc';
      if (!search) return true;
      return `${e.name} ${JSON.stringify(e.system)} ${JSON.stringify(e.flags)}`.toLowerCase().includes(search.toLowerCase());
    });
  }, [activeProject, activeCollection, search, section]);

  const selected = entities.find((e) => e._id === selectedId) ?? entities[0];

  useEffect(() => {
    if (selected) setSelectedId(selected._id);
  }, [selected]);

  useEffect(() => {
    if (!activeProject) return;
    const timer = setTimeout(async () => {
      await putProject(activeProject);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeProject]);

  const updateProject = (next: ProjectData) => {
    next.updatedAt = Date.now();
    next.versions = [{ id: crypto.randomUUID(), timestamp: Date.now(), data: structuredClone(next) }, ...next.versions].slice(0, 15);
    setProjects((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

  const patchEntity = (collection: CollectionType, id: string, patch: Partial<FoundryBase>) => {
    if (!activeProject) return;
    const list = activeProject[collection].map((e) => (e._id === id ? { ...e, ...patch } : e));
    updateProject({ ...activeProject, [collection]: list });
  };

  const patchSystemPath = (collection: CollectionType, id: string, path: string, value: unknown) => {
    if (!activeProject) return;
    const list = activeProject[collection].map((e) => {
      if (e._id !== id) return e;
      const next = structuredClone(e);
      const nodes = path.split('.');
      let cursor: any = next.system;
      nodes.slice(0, -1).forEach((n) => {
        if (cursor[n] == null || typeof cursor[n] !== 'object') cursor[n] = {};
        cursor = cursor[n];
      });
      cursor[nodes.at(-1)!] = value;
      return next;
    });
    updateProject({ ...activeProject, [collection]: list });
  };

  const addEntity = (collection: CollectionType) => {
    if (!activeProject) return;
    const next = emptyByCollection[collection]();
    updateProject({ ...activeProject, [collection]: [next, ...activeProject[collection]] });
    setSelectedId(next._id);
  };

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeProject || !activeCollection) return;
    const data = JSON.parse(await file.text());
    const imported = Array.isArray(data) ? data : [data];
    const normalized = imported.map((i) => ({ ...i, _id: i._id || crypto.randomUUID(), system: i.system ?? {} }));
    updateProject({ ...activeProject, [activeCollection]: [...normalized, ...activeProject[activeCollection]] });
  };

  const exportJson = (mode: 'entity' | 'project' | 'package') => {
    if (!activeProject) return;
    const payload =
      mode === 'project'
        ? activeProject
        : mode === 'entity'
          ? selected
          : {
              manifest: { name: activeProject.name, exportedAt: new Date().toISOString() },
              actors: activeProject.actors,
              items: activeProject.items,
              journal: activeProject.journal,
              tables: activeProject.tables
            };
    if (!payload) return;
    const blob = new Blob([jsonPretty(payload)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeProject.name}-${mode}.json`;
    link.click();
  };

  const validate = () => {
    if (!activeProject) return;
    const found: string[] = [];
    activeProject.actors.forEach((a) => {
      if (!a.name) found.push(`Actor ${a._id}: name required`);
      if (!a.system?.abilities) found.push(`Actor ${a.name}: abilities missing`);
    });
    activeProject.items.forEach((i) => {
      if (!i.type) found.push(`Item ${i.name}: type missing`);
    });
    setErrors(found);
  };

  const fixDefaults = () => {
    if (!activeProject) return;
    const fixed = structuredClone(activeProject);
    fixed.actors = fixed.actors.map((a) => ({ ...a, system: { abilities: {}, attributes: {}, skills: {}, ...a.system } }));
    fixed.items = fixed.items.map((i) => ({ ...i, type: i.type || 'loot', system: i.system ?? {} }));
    updateProject(fixed);
    validate();
  };

  if (!activeProject) return <div className="shell">Loading...</div>;

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Mini Foundry 5e</h1>
        <select value={activeProjectId} onChange={(e) => setActiveProjectId(e.target.value)}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {sections.map((s) => (
          <button key={s} className={section === s ? 'active' : ''} onClick={() => setSection(s)}>{s.toUpperCase()}</button>
        ))}
      </aside>
      <main>
        <header className="topbar">
          <input placeholder="Global search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={() => exportJson('entity')}>Export Entity</button>
          <button onClick={() => exportJson('project')}>Export Project JSON</button>
          <button onClick={() => exportJson('package')}>Export Package</button>
          <label className="import">
            Import JSON<input type="file" accept="application/json" onChange={importJson} />
          </label>
        </header>
        {section === 'dashboard' && <Dashboard project={activeProject} />}
        {section === 'settings' && (
          <section className="panel">
            <h2>Validation & Versioning</h2>
            <button onClick={validate}>Validate schema</button>
            <button onClick={fixDefaults}>Fix with defaults</button>
            <p>Autosave to IndexedDB enabled. Stored versions: {activeProject.versions.length}.</p>
            {!!errors.length && <ul>{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
          </section>
        )}
        {activeCollection && selected && (
          <section className="workspace">
            <div className="listPane">
              <div className="listActions">
                <button onClick={() => addEntity(activeCollection)}>+ Add</button>
                <small>{entities.length} records</small>
              </div>
              <div className="list virtualized">
                {entities.slice(0, 250).map((e) => (
                  <article key={e._id} draggable onDragStart={(ev) => ev.dataTransfer.setData('text/plain', JSON.stringify(e))} className={selected._id === e._id ? 'selected card' : 'card'} onClick={() => setSelectedId(e._id)}>
                    <strong>{e.name}</strong>
                    <span>{e.type}</span>
                  </article>
                ))}
              </div>
            </div>
            <div className="editorPane" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
              e.preventDefault();
              if (activeCollection !== 'actors' || !selected) return;
              const raw = e.dataTransfer.getData('text/plain');
              if (!raw) return;
              const dropped = JSON.parse(raw) as FoundryBase;
              const items = selected.system.items ?? [];
              patchSystemPath('actors', selected._id, 'items', [...items, dropped]);
            }}>
              <Editor entity={selected} collection={activeCollection} patch={patchEntity} patchSystem={patchSystemPath} setModal={setModal} />
            </div>
          </section>
        )}
      </main>
      {modal === 'skills' && selected && activeCollection === 'actors' && (
        <Modal title="Skills" onClose={() => setModal(null)}>
          <div className="chipGrid">
            {allSkills.map((s) => {
              const current = selected.system?.skills?.[s]?.value ?? 0;
              const next = (current + 1) % 4;
              return <button key={s} onClick={() => patchSystemPath('actors', selected._id, `skills.${s}.value`, next)}>{s}: {['none', 'prof', 'exp', 'half'][current]}</button>;
            })}
          </div>
        </Modal>
      )}
      {modal === 'resistance' && selected && activeCollection === 'actors' && (
        <Modal title="Resist / Immunities" onClose={() => setModal(null)}>
          {['acid', 'cold', 'fire', 'poison', 'necrotic', 'radiant'].map((dmg) => (
            <button key={dmg} onClick={() => {
              const arr: string[] = selected.system?.traits?.dr?.value ?? [];
              const next = arr.includes(dmg) ? arr.filter((x) => x !== dmg) : [...arr, dmg];
              patchSystemPath('actors', selected._id, 'traits.dr.value', next);
            }}>{dmg}</button>
          ))}
        </Modal>
      )}
      {modal === 'senses' && selected && activeCollection === 'actors' && (
        <Modal title="Senses" onClose={() => setModal(null)}>
          {['darkvision', 'truesight', 'blindsight', 'tremorsense'].map((sense) => (
            <label key={sense}>{sense}<input type="number" defaultValue={selected.system?.attributes?.senses?.[sense] ?? 0} onBlur={(e) => patchSystemPath('actors', selected._id, `attributes.senses.${sense}`, Number(e.target.value || 0))} /></label>
          ))}
        </Modal>
      )}
    </div>
  );
}

function Dashboard({ project }: { project: ProjectData }) {
  return (
    <section className="panel">
      <h2>{project.name}</h2>
      <p>Campaign collections and quick stats.</p>
      <div className="stats">
        <div>Actors: {project.actors.length}</div><div>Items: {project.items.length}</div><div>Spells: {project.spells.length}</div><div>Effects: {project.effects.length}</div>
      </div>
    </section>
  );
}

function Editor({ entity, collection, patch, patchSystem, setModal }: {
  entity: FoundryBase;
  collection: CollectionType;
  patch: (collection: CollectionType, id: string, patch: Partial<FoundryBase>) => void;
  patchSystem: (collection: CollectionType, id: string, path: string, value: unknown) => void;
  setModal: (kind: 'skills' | 'resistance' | 'senses' | null) => void;
}) {
  return (
    <div className="panel">
      <div className="grid2">
        <label>Name<input value={entity.name} onChange={(e) => patch(collection, entity._id, { name: e.target.value })} /></label>
        <label>Type<input value={entity.type} onChange={(e) => patch(collection, entity._id, { type: e.target.value })} /></label>
        <label>Image<input value={entity.img || ''} onChange={(e) => patch(collection, entity._id, { img: e.target.value })} /></label>
      </div>

      {collection === 'actors' && (
        <>
          <div className="grid3">
            {abilityKeys.map((ab) => {
              const score = Number(entity.system?.abilities?.[ab]?.value ?? 10);
              const mod = Math.floor((score - 10) / 2);
              return <label key={ab}>{ab.toUpperCase()}<input type="number" value={score} onChange={(e) => patchSystem(collection, entity._id, `abilities.${ab}.value`, Number(e.target.value))} /><small>mod {mod >= 0 ? '+' : ''}{mod}</small></label>;
            })}
          </div>
          <div className="grid3">
            <label>AC<input type="number" value={entity.system?.attributes?.ac?.value ?? 10} onChange={(e) => patchSystem(collection, entity._id, 'attributes.ac.value', Number(e.target.value))} /></label>
            <label>HP<input type="number" value={entity.system?.attributes?.hp?.value ?? 1} onChange={(e) => patchSystem(collection, entity._id, 'attributes.hp.value', Number(e.target.value))} /></label>
            <label>Speed<input type="number" value={entity.system?.attributes?.movement?.walk ?? 30} onChange={(e) => patchSystem(collection, entity._id, 'attributes.movement.walk', Number(e.target.value))} /></label>
          </div>
          <div className="chips">
            <button onClick={() => setModal('skills')}>Skills modal</button>
            <button onClick={() => setModal('resistance')}>Resistances modal</button>
            <button onClick={() => setModal('senses')}>Senses modal</button>
          </div>
          <h4>Legendary</h4>
          <label>Legendary Resistances<input type="number" value={entity.system?.resources?.legres?.value ?? 0} onChange={(e) => patchSystem(collection, entity._id, 'resources.legres.value', Number(e.target.value))} /></label>
          <label>Lair Active<input type="checkbox" checked={entity.system?.lair?.enabled ?? false} onChange={(e) => patchSystem(collection, entity._id, 'lair.enabled', e.target.checked)} /></label>
        </>
      )}

      {collection === 'items' && (
        <div className="grid2">
          <label>Price<input type="number" value={entity.system?.price ?? 0} onChange={(e) => patchSystem(collection, entity._id, 'price', Number(e.target.value))} /></label>
          <label>Weight<input type="number" value={entity.system?.weight ?? 0} onChange={(e) => patchSystem(collection, entity._id, 'weight', Number(e.target.value))} /></label>
          <label>Damage<input value={entity.system?.damage?.parts?.[0]?.[0] ?? ''} onChange={(e) => patchSystem(collection, entity._id, 'damage.parts', [[e.target.value, 'slashing']])} /></label>
          <label>Range<input value={entity.system?.range?.value ?? ''} onChange={(e) => patchSystem(collection, entity._id, 'range.value', Number(e.target.value))} /></label>
        </div>
      )}

      {collection === 'spells' && (
        <div className="grid2">
          <label>Level<input type="number" value={entity.system?.level ?? 0} onChange={(e) => patchSystem(collection, entity._id, 'level', Number(e.target.value))} /></label>
          <label>School<input value={entity.system?.school ?? ''} onChange={(e) => patchSystem(collection, entity._id, 'school', e.target.value)} /></label>
          <label>Cast time<input value={entity.system?.activation?.type ?? ''} onChange={(e) => patchSystem(collection, entity._id, 'activation.type', e.target.value)} /></label>
          <label>Concentration<input type="checkbox" checked={entity.system?.concentration ?? false} onChange={(e) => patchSystem(collection, entity._id, 'concentration', e.target.checked)} /></label>
        </div>
      )}

      {collection === 'effects' && (
        <div>
          <label>Enabled<input type="checkbox" checked={!entity.system?.disabled} onChange={(e) => patchSystem(collection, entity._id, 'disabled', !e.target.checked)} /></label>
          <label>Duration rounds<input type="number" value={entity.system?.duration?.rounds ?? 0} onChange={(e) => patchSystem(collection, entity._id, 'duration.rounds', Number(e.target.value))} /></label>
          <label>Change key<input value={entity.system?.changes?.[0]?.key ?? ''} onChange={(e) => patchSystem(collection, entity._id, 'changes.0.key', e.target.value)} /></label>
          <label>Change value<input value={entity.system?.changes?.[0]?.value ?? ''} onChange={(e) => patchSystem(collection, entity._id, 'changes.0.value', e.target.value)} /></label>
        </div>
      )}

      {(collection === 'journal' || collection === 'tables') && (
        <label>Description<textarea value={collection === 'journal' ? entity.system?.content ?? '' : jsonPretty(entity.system?.results ?? [])} onChange={(e) => patchSystem(collection, entity._id, collection === 'journal' ? 'content' : 'results', collection === 'journal' ? e.target.value : JSON.parse(e.target.value || '[]'))} /></label>
      )}

      <h4>Raw JSON (round-trip safe)</h4>
      <textarea className="raw" value={jsonPretty(entity)} onChange={(e) => {
        try {
          patch(collection, entity._id, JSON.parse(e.target.value));
        } catch {
          // live raw editor
        }
      }} />
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modalBack" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header><h3>{title}</h3><button onClick={onClose}>x</button></header>
        {children}
      </div>
    </div>
  );
}

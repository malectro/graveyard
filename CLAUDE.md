# Graveyard

An interactive, collaborative multiplayer graveyard where users explore a 2D world, read epitaphs on tombstones, and place their own.

## Tech Stack

- **Client:** TypeScript, Pixi.js 5 (2D WebGL), React 17, RxJS 6, Emotion CSS
- **Server:** Deno 2
- **Build:** Rollup (bundler), Deno scripts for build/serve

## Development

Requires Node.js and Deno 2.

```bash
npm install
deno tools/build.ts       # build client (add `dev` for watch mode)
deno tools/serve.ts       # serve on localhost
```

Build output goes to `build/`. The entry point is `build/index.html` which loads Pixi.js from CDN and the bundled `client.js`.

## Architecture

ECS-inspired component system. Each entity has:
- **box** (physics) - position, size, velocity, collision
- **graphic** - Pixi.js sprite (static or animated)
- **species** - config/metadata (collision flags, epitaph text)
- **trigger** - optional interaction (proximity-activated epitaph display)

### Key Source Files

| File | Purpose |
|------|---------|
| `src/client.ts` | Client entry point, game loop (Pixi ticker) |
| `src/game.ts` | Game class, central coordinator |
| `src/state2.ts` | Game state: entities, hero, mode, assets, species |
| `src/entity.ts` | Entity definition and deserialization |
| `src/physics.ts` | StaticPhysics / DynamicPhysics (velocity, collision) |
| `src/graphic.ts` | StaticGraphic / AnimatedGraphic (sprite rendering) |
| `src/trigger.ts` | Trigger system for proximity-based epitaph activation |
| `src/hero.ts` | Player character logic |
| `src/controls.ts` | ExplorationController (play) / PlacementController (edit) + GlobalInput |
| `src/view.ts` | Camera/viewport following |
| `src/server.ts` | Deno WebSocket server (partially implemented) |
| `src/data/state.ts` | Hardcoded initial game state JSON (entities, assets, species) |
| `src/ui/app.tsx` | Main React UI (mode toggle, dialogs) |
| `src/ui/EpitaphDialog.tsx` | Epitaph text input dialog |
| `src/ui/AlertDialog.tsx` | Modal for reading epitaphs |

### Game Modes

- **Play mode:** Arrow keys move hero, Space activates nearby tombstone triggers
- **Edit mode:** Arrow keys / mouse drag position a "future plot" preview, Space places it and opens epitaph dialog

### Data Flow

1. State loaded from hardcoded JSON in `src/data/state.ts`
2. Entities deserialized via ClassParser (dynamic class instantiation by className)
3. Game loop: tick all entities (physics update) -> graphics update -> camera follows focus
4. Tombstone placement: collision-checked, then new entity added to state and Pixi world

## Current State

**Working:** Hero movement/animation, tombstone placement with epitaph, collision detection with perpendicular sliding, epitaph reading via proximity trigger, mode toggling, mouse drag placement, camera following.

**Not yet implemented:**
- Database persistence (tombstones only exist in memory)
- WebSocket multiplayer (server code exists but is commented out; message types defined for `hero/appear`, `hero/move`, `hero/getView`)
- Entity streaming based on player location
- Procedural foliage generation
- Player character customization / ghost visual for tombstone owners
- Z-index layering for entities
- Sprite sheet optimization

See `TODO.md` for the full task list.

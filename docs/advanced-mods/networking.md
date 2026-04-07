---
layout: default
title: External Network Requests
parent: Advanced mods
nav_order: 4
---

# External Network Requests

Mods can make external network requests using the standard browser `fetch()` API. There are no Content Security Policy restrictions blocking outbound requests from mod code, so you can retrieve data from any URL accessible from the player's machine.

## When to Use

External requests let your mod:

- Fetch dynamic configuration or content from a server you control
- Integrate with external APIs (leaderboards, community data, etc.)
- Load supplemental mod data without bundling it into the mod file

## Basic Usage

`fetch()` works as normal. Requests are asynchronous, so use `async`/`await` or promise chaining:

```typescript
async function loadRemoteData(url: string): Promise<MyData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<MyData>;
}
```

## Integrating with Mod Hooks

Fetch data before registering hooks, or store it in module scope for later use:

```typescript
let remoteConfig: MyConfig | undefined;

async function init(modAPI: ModAPI) {
  try {
    const response = await fetch('https://my-mod-server.example.com/config.json');
    if (response.ok) {
      remoteConfig = (await response.json()) as MyConfig;
    }
  } catch (e) {
    console.error('[MyMod] Failed to load remote config, using defaults:', e);
  }

  modAPI.hooks.onCalculateDamage((attacker, defender, damage, damageType, gameFlags) => {
    const multiplier = remoteConfig?.damageMultiplier ?? 1;
    return damage * multiplier;
  });
}

export { init };
```

## Timing Considerations

The game does not wait for your network requests to complete. If your hook logic depends on fetched data, initialise sensible defaults before the `await` resolves, and update behaviour once the request finishes.

```typescript
// Safe pattern: default immediately, update when data arrives
let bonusLootEnabled = false;

fetch('https://my-mod-server.example.com/event-status.json')
  .then(r => r.json())
  .then((data: { bonusLoot: boolean }) => {
    bonusLootEnabled = data.bonusLoot;
  })
  .catch(() => {
    // Keep default (false)
  });

modAPI.hooks.onLootDrop((items, gameFlags) => {
  if (bonusLootEnabled) {
    console.log('[MyMod] Bonus loot active — player received', items.length, 'items');
  }
});
```

## Error Handling

Always guard network calls. Player environments vary — firewalls, offline play, and transient failures are common. A mod that crashes because a fetch fails will break the player's session.

```typescript
async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
```

## Limitations

- Requests are subject to standard CORS rules enforced by the server you are contacting. You cannot bypass CORS restrictions on the server side.
- The game runs in Electron, so `file://` URLs and local loopback addresses are accessible in addition to remote URLs.
- Avoid making requests inside hot code paths (e.g. `onReduxAction`) — fire them once during initialisation or on low-frequency events.

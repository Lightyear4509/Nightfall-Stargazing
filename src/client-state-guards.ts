export type HydratedPreference = 'saved' | 'nightMode' | 'location' | 'followLocation';

/** Prevents late startup reads from overwriting a preference changed by the user. */
export class PreferenceHydrationGuard {
  private readonly edited = new Set<HydratedPreference>();

  markEdited(preference: HydratedPreference) {
    this.edited.add(preference);
  }

  mayApplyStoredValue(preference: HydratedPreference) {
    return !this.edited.has(preference);
  }
}

/** Invalidates callbacks from a stopped, replaced, or backgrounded location watcher. */
export class LocationSessionGuard {
  private sessionId = 0;

  begin() {
    this.sessionId += 1;
    return this.sessionId;
  }

  invalidate() {
    this.sessionId += 1;
  }

  isCurrent(sessionId: number) {
    return this.sessionId === sessionId;
  }
}

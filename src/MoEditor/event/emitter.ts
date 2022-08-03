export interface Event {
  name: string;
}

/**
 *
 */
class EventDispatcher {
  on(name: string, callback: (data: Event) => unknown) {}
  emit(data: Event) {}
  off(name: string) {}
}

export const eventDispatcher = new EventDispatcher();

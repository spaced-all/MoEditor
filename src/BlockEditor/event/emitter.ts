import { IEventListener } from "./listener";

export interface TEvent {
  name: string;
  data: any;
}

export interface IDisposable {
  dispose(): void;
}

export interface IEventEmitter<TEvent> {
  on(listener: IEventListener<TEvent>): IDisposable;
  emit(event: TEvent): void;
}

export class EventEmitter<TEvent> {
  protected listeners: IEventListener<TEvent>[] = [];
  protected listener: IEventListener<TEvent> = null;

  on(listener: IEventListener<TEvent>): IDisposable {
    // this.listeners.push(listener);
    this.listener = listener;
    return {
      dispose: () => {
        const index = this.listeners.indexOf(listener);
        if (index < 0) {
          return;
        }
        this.listeners.splice(index, 1);
      },
    };
  }

  call(event: TEvent) {
    // this.listeners.forEach((listener) => listener(event));
    return this.listener(event);
  }
}

export class EventManager {
  events: { [key: string]: EventEmitter<TEvent> };
  static _instance: EventManager;
  constructor() {
    this.events = {};
  }
  on(component: string, listener: IEventListener<TEvent>) {
    console.log(["regist", component]);
    if (!this.events[component]) {
      this.events[component] = new EventEmitter<TEvent>();
    }
    return this.events[component].on(listener);
  }
  call(component: string, eventData: TEvent): any {
    if (!this.events[component]) {
      return;
    }
    return this.events[component].call(eventData);
  }
}

import React from "react";
import { crmStore } from "@/store/CrmStore";

/**
 * Base class for components that read from the CRM store. It wires up the
 * subscription lifecycle so subclasses can simply read `this.store.getState()`
 * in render. Subclasses that need their own mount/unmount logic should override
 * `afterMount` / `beforeUnmount` instead of the React lifecycle methods.
 */
export abstract class StoreComponent<
  P = {},
  S = {}
> extends React.Component<P, S> {
  protected store = crmStore;
  private unsubscribe: (() => void) | null = null;

  componentDidMount(): void {
    this.unsubscribe = this.store.subscribe(this.handleStoreChange);
    this.afterMount();
  }

  componentWillUnmount(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.beforeUnmount();
  }

  private handleStoreChange = (): void => {
    this.forceUpdate();
  };

  /** Optional hook for subclasses. */
  protected afterMount(): void {}
  /** Optional hook for subclasses. */
  protected beforeUnmount(): void {}
}

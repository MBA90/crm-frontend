import React from "react";
import { Icon } from "@/components/ui/Icon";

interface ToastItem {
  id: number;
  message: string;
}
type Listener = (items: ToastItem[]) => void;

class ToastManager {
  private items: ToastItem[] = [];
  private listeners = new Set<Listener>();
  private seq = 0;

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  private emit(): void {
    this.listeners.forEach((l) => l([...this.items]));
  }

  show(message: string): void {
    const id = ++this.seq;
    this.items = [...this.items, { id, message }];
    this.emit();
    window.setTimeout(() => {
      this.items = this.items.filter((i) => i.id !== id);
      this.emit();
    }, 2600);
  }
}

export const toast = new ToastManager();

interface ToastHostState {
  items: ToastItem[];
}

export class ToastHost extends React.Component<{}, ToastHostState> {
  state: ToastHostState = { items: [] };
  private unsub: (() => void) | null = null;

  componentDidMount(): void {
    this.unsub = toast.subscribe((items) => this.setState({ items }));
  }

  componentWillUnmount(): void {
    this.unsub?.();
  }

  render(): React.ReactNode {
    const { items } = this.state;
    if (items.length === 0) return null;
    return (
      <div className="toast-wrap">
        {items.map((t) => (
          <div className="toast" key={t.id}>
            <Icon name="check" size={16} />
            {t.message}
          </div>
        ))}
      </div>
    );
  }
}

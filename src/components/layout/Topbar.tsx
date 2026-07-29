import React from "react";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { crmStore } from "@/store/CrmStore";
import { authStore, type AuthUser } from "@/auth/AuthStore";
import { fullName, initials } from "@/lib/format";
import { withRouter, type RouterProps } from "@/lib/withRouter";

interface TopbarProps {
  title: string;
  router: RouterProps;
}
interface TopbarState {
  query: string;
  open: boolean;
}

interface SearchHit {
  type: "Contact" | "Company" | "Deal";
  id: string;
  label: string;
  sub: string;
  to: string;
}

class TopbarBase extends React.Component<TopbarProps, TopbarState> {
  state: TopbarState = { query: "", open: false };
  private rootRef = React.createRef<HTMLDivElement>();

  private unsubscribeAuth: (() => void) | null = null;

  componentDidMount(): void {
    document.addEventListener("mousedown", this.handleOutside);
    this.unsubscribeAuth = authStore.subscribe(() => this.forceUpdate());
  }
  componentWillUnmount(): void {
    document.removeEventListener("mousedown", this.handleOutside);
    this.unsubscribeAuth?.();
    this.unsubscribeAuth = null;
  }

  private avatarLabel(user: AuthUser | null): string {
    if (user?.firstName || user?.lastName) {
      return initials(user.firstName ?? "", user.lastName ?? "");
    }
    const source = user?.name ?? user?.username ?? user?.email ?? "?";
    return source.slice(0, 2).toUpperCase();
  }

  private handleOutside = (e: MouseEvent): void => {
    if (this.rootRef.current && !this.rootRef.current.contains(e.target as Node)) {
      this.setState({ open: false });
    }
  };

  private results(): SearchHit[] {
    const q = this.state.query.trim().toLowerCase();
    if (!q) return [];
    const s = crmStore.getState();
    const hits: SearchHit[] = [];
    for (const c of s.contacts) {
      const name = fullName(c.firstName, c.lastName);
      if (name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
        hits.push({
          type: "Contact",
          id: c.id,
          label: name,
          sub: c.email,
          to: `/contacts/${c.id}`,
        });
      }
    }
    for (const co of s.companies) {
      if (co.name.toLowerCase().includes(q)) {
        hits.push({
          type: "Company",
          id: co.id,
          label: co.name,
          sub: co.industry,
          to: "/companies",
        });
      }
    }
    for (const d of s.deals) {
      if (d.title.toLowerCase().includes(q)) {
        hits.push({ type: "Deal", id: d.id, label: d.title, sub: d.stage, to: "/deals" });
      }
    }
    return hits.slice(0, 6);
  }

  private go(hit: SearchHit): void {
    this.setState({ query: "", open: false });
    this.props.router.navigate(hit.to);
  }

  render(): React.ReactNode {
    const { title } = this.props;
    const { query, open } = this.state;
    const hits = open ? this.results() : [];
    const user = authStore.getState().user;

    return (
      <header className="topbar">
        <div className="topbar__title">{title}</div>

        <div className="topbar__search" ref={this.rootRef} style={{ position: "relative" }}>
          <Icon name="search" size={16} />
          <input
            type="text"
            placeholder="Search contacts, accounts, deals…"
            value={query}
            onChange={(e) => this.setState({ query: e.target.value, open: true })}
            onFocus={() => this.setState({ open: true })}
          />
          {open && query.trim() && (
            <div
              style={{
                position: "absolute",
                top: "46px",
                left: 0,
                right: 0,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
                zIndex: 40,
              }}
            >
              {hits.length === 0 ? (
                <div style={{ padding: "16px", color: "var(--muted)", fontSize: 13 }}>
                  No matches for “{query}”.
                </div>
              ) : (
                hits.map((h) => (
                  <button
                    key={`${h.type}-${h.id}`}
                    onClick={() => this.go(h)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface-2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span
                      className="badge badge--gray"
                      style={{ fontSize: 10, minWidth: 62, justifyContent: "center" }}
                    >
                      {h.type}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{h.sub}</div>
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button className="btn btn--ghost btn--icon" aria-label="Notifications">
          <Icon name="inbox" size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right", lineHeight: 1.2 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {user?.name ?? user?.username ?? "Account"}
            </div>
            {user?.email && (
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{user.email}</div>
            )}
          </div>
          <Avatar
            label={this.avatarLabel(user)}
            seed={user?.sub ?? "account-owner"}
            size="sm"
          />
          <button
            className="btn btn--ghost btn--icon"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => authStore.logout()}
          >
            <Icon name="log-out" size={18} />
          </button>
        </div>
      </header>
    );
  }
}

export const Topbar = withRouter(TopbarBase);

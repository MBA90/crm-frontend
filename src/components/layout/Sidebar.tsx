import React from "react";
import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { StoreComponent } from "@/store/StoreComponent";

interface NavDef {
  to: string;
  label: string;
  icon: IconName;
}

const NAV: NavDef[] = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/deals", label: "Pipeline", icon: "deals" },
  { to: "/contacts", label: "Contacts", icon: "contacts" },
  { to: "/companies", label: "Companies", icon: "companies" },
  { to: "/tasks", label: "Tasks", icon: "tasks" },
];

export class Sidebar extends StoreComponent {
  render(): React.ReactNode {
    const { tasks } = this.store.getState();
    const openTasks = tasks.filter((t) => !t.done).length;

    return (
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M11 15L16 9l5 6"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 18.5Q16 24 24 18.5"
                stroke="#fff"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="brand__name">Sanad</div>
          </div>
        </div>

        <div className="nav-group-label">Workspace</div>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
            {item.to === "/tasks" && openTasks > 0 && (
              <span className="nav-item__badge">{openTasks}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-group-label">Account</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          <Icon name="settings" size={18} />
          <span>Settings</span>
        </NavLink>

        <div className="sidebar__foot">
          <Avatar label="AR" seed="account-owner" size="sm" />
          <div>
            <div className="sidebar__foot-name">Alex Rivera</div>
            <div className="sidebar__foot-role">Sales Manager</div>
          </div>
        </div>
      </aside>
    );
  }
}

import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { withRouter, type RouterProps } from "@/lib/withRouter";

interface AppLayoutProps {
  router: RouterProps;
}

const TITLES: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/", title: "Dashboard" },
  { match: (p) => p.startsWith("/deals"), title: "Pipeline" },
  { match: (p) => p.startsWith("/contacts"), title: "Contacts" },
  { match: (p) => p.startsWith("/companies"), title: "Accounts" },
  { match: (p) => p.startsWith("/accounts"), title: "Accounts" },
  { match: (p) => p.startsWith("/tasks"), title: "Tasks" },
  { match: (p) => p.startsWith("/workflow-requests"), title: "Workflow requests" },
  { match: (p) => p.startsWith("/settings"), title: "Settings" },
];

class AppLayoutBase extends React.Component<AppLayoutProps> {
  private title(): string {
    const path = this.props.router.location.pathname;
    return TITLES.find((t) => t.match(path))?.title ?? "Sanad";
  }

  render(): React.ReactNode {
    return (
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar title={this.title()} />
          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    );
  }
}

export const AppLayout = withRouter(AppLayoutBase);

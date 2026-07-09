import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "@/auth/AuthStore";
import { AuthScreen } from "@/auth/AuthScreen";
import { withRouter, type RouterProps } from "@/lib/withRouter";

interface RequireAuthProps {
  router: RouterProps;
  children: React.ReactNode;
}

/**
 * Gate that only renders its children once the user is authenticated. While the
 * session is being restored it shows a loading screen; if the user is not
 * authenticated it redirects to the public `/login` page, remembering the
 * current location so we can return here after sign-in.
 */
class RequireAuthBase extends React.Component<RequireAuthProps> {
  private unsubscribe: (() => void) | null = null;

  componentDidMount(): void {
    this.unsubscribe = authStore.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  render(): React.ReactNode {
    const { status } = authStore.getState();
    if (status === "authenticated") return <>{this.props.children}</>;
    if (status === "loading") {
      return <AuthScreen message="Restoring your session…" />;
    }

    const { location } = this.props.router;
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }
}

export const RequireAuth = withRouter(RequireAuthBase);
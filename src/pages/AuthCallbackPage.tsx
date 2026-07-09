import React from "react";
import { authStore } from "@/auth/AuthStore";
import { AuthScreen } from "@/auth/AuthScreen";
import { withRouter, type RouterProps } from "@/lib/withRouter";

interface AuthCallbackProps {
  router: RouterProps;
}
interface AuthCallbackState {
  error: string | null;
}

/**
 * Handles the redirect back from Keycloak. It exchanges the authorization code
 * for tokens (via AuthStore.completeLogin) and then replaces the callback URL
 * with wherever the user was originally headed.
 */
class AuthCallbackBase extends React.Component<AuthCallbackProps, AuthCallbackState> {
  state: AuthCallbackState = { error: null };

  componentDidMount(): void {
    authStore
      .completeLogin()
      .then((returnTo) => this.props.router.navigate(returnTo, { replace: true }))
      .catch((err: unknown) =>
        this.setState({
          error: err instanceof Error ? err.message : "Sign-in failed.",
        })
      );
  }

  render(): React.ReactNode {
    return (
      <AuthScreen
        message="Signing you in…"
        error={this.state.error}
        onRetry={this.state.error ? () => void authStore.login("/") : undefined}
      />
    );
  }
}

export const AuthCallbackPage = withRouter(AuthCallbackBase);
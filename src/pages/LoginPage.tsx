import React from "react";
import { Navigate } from "react-router-dom";
import { authStore } from "@/auth/AuthStore";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon, type IconName } from "@/components/ui/Icon";

interface LoginPageProps {
  router: RouterProps;
}
interface LoginPageState {
  redirecting: boolean;
}

/** The Sanad logo mark, matching the one in the sidebar. */
function BrandMark(): React.ReactElement {
  return (
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
  );
}

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "deals",
    title: "Visual pipeline",
    desc: "Drag deals through every stage with clarity.",
  },
  {
    icon: "contacts",
    title: "Unified contacts",
    desc: "One source of truth for people and accounts.",
  },
  {
    icon: "activity",
    title: "Team activity",
    desc: "Stay on top of tasks, notes, and follow-ups.",
  },
];

/**
 * Public landing page shown to unauthenticated visitors. It does not redirect on
 * its own: the user clicks "Sign in" to begin the Keycloak Authorization Code
 * flow. If a session is already active it bounces straight to the app.
 */
class LoginPageBase extends React.Component<LoginPageProps, LoginPageState> {
  state: LoginPageState = { redirecting: false };
  private unsubscribe: (() => void) | null = null;

  componentDidMount(): void {
    this.unsubscribe = authStore.subscribe(() => this.forceUpdate());
  }

  componentWillUnmount(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Where to land after login: the page the user originally tried to reach. */
  private returnTo(): string {
    const state = this.props.router.location.state as { from?: string } | null;
    return state?.from ?? "/";
  }

  private signIn = (): void => {
    this.setState({ redirecting: true });
    void authStore.login(this.returnTo());
  };

  render(): React.ReactNode {
    const { status } = authStore.getState();
    if (status === "authenticated") {
      return <Navigate to={this.returnTo()} replace />;
    }
    const { redirecting } = this.state;

    return (
      <div className="auth">
        {/* ===== Brand panel ===== */}
        <section className="auth__brand">
          <div className="auth__aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="auth__brand-top">
            <BrandMark />
            <div className="brand__name">Sanad</div>
          </div>

          <div className="auth__brand-body auth-rise">
            <span className="auth__eyebrow">
              <span className="dot" />
              Enterprise CRM platform
            </span>

            <h2 className="auth__headline">
              Turn every conversation into <span className="grad">revenue.</span>
            </h2>
            <p className="auth__subhead">
              Pipeline, contacts, and activity in one fast, focused workspace —
              secured with enterprise single sign-on.
            </p>

            <div className="auth__features">
              {FEATURES.map((f) => (
                <div className="auth__feature" key={f.title}>
                  <span className="auth__feature-ic">
                    <Icon name={f.icon} size={17} />
                  </span>
                  <div>
                    <div className="auth__feature-t">{f.title}</div>
                    <div className="auth__feature-d">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="auth__brand-foot">
            © {new Date().getFullYear()} Sanad
          </div>
        </section>

        {/* ===== Sign-in panel ===== */}
        <section className="auth__panel">
          <div className="auth-card auth-rise">
            <div className="auth-card__logo">
              <BrandMark />
              <div className="brand__name" style={{ color: "var(--text)" }}>
                Sanad
              </div>
            </div>

            <div className="auth-card__eyebrow">Welcome back</div>
            <h1>Sign in to your workspace</h1>
            <p className="auth-card__lead">
              Use your organization account to continue. You'll be securely
              redirected to your identity provider.
            </p>

            <div className="auth-card__form">
              <button
                className="btn btn--sso"
                onClick={this.signIn}
                disabled={redirecting}
              >
                {redirecting ? (
                  <>
                    <Spinner />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <Icon name="log-in" size={19} />
                    Continue with single sign-on
                  </>
                )}
              </button>

              <div className="auth-sso-note">
                <Icon name="check" size={14} />
                Secured with single sign-on
              </div>
            </div>

            <div className="auth-divider">Protected area</div>

            <p className="auth-card__foot">
              Only members of your organization can access this workspace. Trouble
              signing in? <a href="mailto:it@sanadcrm.app">Contact your admin</a>.
            </p>
          </div>
        </section>
      </div>
    );
  }
}

/** Small inline loading spinner for the sign-in button. */
function Spinner(): React.ReactElement {
  return (
    <svg
      className="spin"
      width={19}
      height={19}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.2-8.6" opacity={0.9} />
    </svg>
  );
}

export const LoginPage = withRouter(LoginPageBase);
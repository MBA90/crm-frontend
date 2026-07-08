import React from "react";
import {
  useNavigate,
  useParams,
  useLocation,
  type NavigateFunction,
  type Location,
  type Params,
} from "react-router-dom";

export interface RouterProps {
  navigate: NavigateFunction;
  params: Readonly<Params<string>>;
  location: Location;
}

/**
 * React Router v6 removed the `withRouter` HOC because it favors hooks, which
 * cannot be used in class components. This restores it: it injects a `router`
 * prop containing navigate, params, and location into the wrapped component.
 */
export function withRouter<P extends { router: RouterProps }>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, "router">> {
  return function WithRouter(props: Omit<P, "router">) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const router: RouterProps = { navigate, params, location };
    return <Component {...(props as P)} router={router} />;
  };
}

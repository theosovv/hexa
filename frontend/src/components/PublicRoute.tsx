import { useNavigate } from "@solidjs/router";
import { type ParentComponent, createEffect } from "solid-js";

import { useAuth } from "../contexts/AuthContext";

export const PublicRoute: ParentComponent = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();

  createEffect(() => {
    if (auth.isAuthenticated()) {
      navigate("/", { replace: true });
    }
  });

  return <>{props.children}</>;
};

import { useNavigate } from "@solidjs/router";
import { Show, type ParentComponent, createEffect } from "solid-js";

import { css } from "../../styled-system/css";
import { useAuth } from "../contexts/AuthContext";
import { Container, Spinner } from "../uikit";

export const ProtectedRoute: ParentComponent = (props) => {
  const auth = useAuth();
  const navigate = useNavigate();

  createEffect(() => {
    if (!auth.isLoading() && !auth.isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  });

  return (
    <Show
      when={!auth.isLoading()}
      fallback={
        <Container center>
          <div class={loadingStyle}>
            <Spinner size="lg" />
            <p class={textStyle}>Loading...</p>
          </div>
        </Container>
      }
    >
      <Show when={auth.isAuthenticated()}>
        {props.children}
      </Show>
    </Show>
  );
};

const loadingStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  gap: "16px",
});

const textStyle = css({
  color: "white",
  fontSize: "18px",
  fontWeight: "600",
});

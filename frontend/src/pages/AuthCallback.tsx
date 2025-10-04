import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";

import { css } from "../../styled-system/css";
import { useAuth } from "../contexts/AuthContext";
import { Container, Spinner } from "../uikit";

export function AuthCallback() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [searchParams] = useSearchParams();

  onMount(() => {
    const accessToken = searchParams.access_token as string;
    const refreshToken = searchParams.refresh_token as string;

    if (accessToken && refreshToken) {
      auth.login(accessToken, refreshToken);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } else {
      navigate("/login?error=no_tokens", { replace: true });
    }
  });

  return (
    <Container center>
      <div class={contentStyle}>
        <Spinner size="lg" />
        <p class={textStyle}>Logging you in...</p>
      </div>
    </Container>
  );
}

const contentStyle = css({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
});

const textStyle = css({
  color: "white",
  fontSize: "18px",
  fontWeight: "600",
});

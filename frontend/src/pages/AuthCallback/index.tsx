import { useNavigate, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";

import { contentStyle, textStyle } from "./styles";

import { useAuth } from "@/contexts/AuthContext";
import { Container, Spinner } from "@/uikit";

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

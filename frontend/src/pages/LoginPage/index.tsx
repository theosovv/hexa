import { useNavigate, useSearchParams } from "@solidjs/router";
import { Show } from "solid-js";

import { buttonsStyle, cardContentStyle, errorStyle, subtitleStyle, titleStyle } from "./styles";

import { apiClient } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Container, GitHubIcon } from "@/uikit";


export function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [searchParams] = useSearchParams();

  const error = () => searchParams.error;

  if (auth.isAuthenticated()) {
    navigate("/", { replace: true });
  }

  const handleGitHubLogin = () => {
    window.location.href = apiClient.getGitHubLoginURL();
  };

  return (
    <Container maxWidth="sm" center>
      <Card>
        <div class={cardContentStyle}>
          <h1 class={titleStyle}>Hexa</h1>
          <p class={subtitleStyle}>Modular Web Synthesizer</p>

          <Show when={error()}>
            <div class={errorStyle}>
              Authentication failed: {error()}
            </div>
          </Show>

          <div class={buttonsStyle}>
            <Button onClick={handleGitHubLogin} variant="secondary" fullWidth>
              <GitHubIcon />
              Continue with GitHub
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
}

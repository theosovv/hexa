import { useNavigate, useSearchParams } from "@solidjs/router";
import { Show } from "solid-js";

import { Logo } from "./components/Logo";
import {
  actionsStyle,
  backgroundStyle,
  cardWrapperStyle,
  containerStyle,
  errorBoxStyle,
  errorIconStyle,
  footerStyle,
  gradientOrbStyle,
  headingStyle,
  taglineStyle,
} from "./styles";

import { apiClient } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button, GitHubIcon } from "@/uikit";

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
    <div class={containerStyle}>
      <div class={backgroundStyle}>
        <div class={gradientOrbStyle} style={{ top: "10%", left: "20%" }} />
        <div class={gradientOrbStyle} style={{ top: "60%", right: "15%" }} />
        <div class={gradientOrbStyle} style={{ bottom: "15%", left: "40%" }} />
      </div>

      <div class={cardWrapperStyle}>
        <Logo />

        <h1 class={headingStyle}>Patchwork</h1>
        <p class={taglineStyle}>Modular Web Synthesizer</p>

        <Show when={error()}>
          <div class={errorBoxStyle}>
            <span class={errorIconStyle}>⚠️</span>
            Authentication failed: {error()}
          </div>
        </Show>

        <div class={actionsStyle}>
          <Button onClick={handleGitHubLogin} variant="primary" size="lg" fullWidth>
            <GitHubIcon />
            Continue with GitHub
          </Button>
        </div>

        <div class={footerStyle}>
          Built with Web Audio API • Open Source
        </div>
      </div>
    </div>
  );
}

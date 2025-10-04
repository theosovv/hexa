import { useNavigate } from "@solidjs/router";

import { css } from "../../styled-system/css";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, Button, Card, Container } from "../uikit";

export function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
  };

  const goToStudio = () => {
    navigate("/studio");
  };

  return (
    <Container maxWidth="md">
      <h1 class={titleStyle}>Hexa</h1>

      <Card>
        <div class={cardContentStyle}>
          <Avatar src={auth.user()?.avatar_url} alt={auth.user()?.email} size="lg" />
          <h2 class={nameStyle}>
            {auth.user()?.display_name || auth.user()?.email}
          </h2>
          <p class={emailStyle}>{auth.user()?.email}</p>
          <p class={storageStyle}>
            Storage: {((auth.user()!.storage_used / 1024 / 1024) || 0).toFixed(2)} MB
            / {(auth.user()!.storage_limit / 1024 / 1024).toFixed(0)} MB
          </p>
          <div class={buttonsStyle}>
            <Button onClick={goToStudio} variant="primary" fullWidth>
              Open Studio
            </Button>
            <Button onClick={handleLogout} variant="danger" fullWidth>
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
}

const buttonsStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

const titleStyle = css({
  fontSize: "48px",
  fontWeight: "bold",
  textAlign: "center",
  margin: "48px 0 32px 0",
});

const cardContentStyle = css({
  textAlign: "center",
});

const nameStyle = css({
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0 8px 0",
});

const emailStyle = css({
  color: "#718096",
  margin: "0 0 16px 0",
});

const storageStyle = css({
  fontSize: "14px",
  color: "#4a5568",
  marginBottom: "24px",
});

import { StudioProvider } from "../../contexts/StudioContext";

import { StudioContent } from "./components/StudioContent";

export function StudioPage() {
  return (
    <StudioProvider>
      <StudioContent />
    </StudioProvider>
  );
}


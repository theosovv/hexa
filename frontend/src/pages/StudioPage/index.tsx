
import { StudioContent } from "./components/StudioContent";

import { StudioProvider } from "@/contexts/StudioContext";

export function StudioPage() {
  return (
    <StudioProvider>
      <StudioContent />
    </StudioProvider>
  );
}


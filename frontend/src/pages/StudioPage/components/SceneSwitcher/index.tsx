import { Show, For } from "solid-js";

import { useStudio } from "@/contexts/StudioContext";
import { containerStyle, emptyStateStyle, labelStyle, sceneButtonActiveStyle, sceneButtonStyle, sceneListStyle } from "./styles";
import { cx } from "@/styled-system/css";
import { Button } from "@/uikit";

export function SceneSwitcher() {
  const studio = useStudio();

  const scenes = () => studio.scenes();
  const activeSceneId = () => studio.activeSceneId();

  const handleCreate = () => studio.createScene();
  const handleUpdate = () => {
    const id = activeSceneId();
    if (id) {
      studio.updateScene(id);
    }
  };
  const handleRemove = () => {
    const id = activeSceneId();
    if (id) {
      studio.removeScene(id);
    }
  };

  return (
    <div class={containerStyle}>
      <span class={labelStyle}>Scenes</span>

      <div class={sceneListStyle}>
        <Show
          when={scenes().length > 0}
          fallback={<span class={emptyStateStyle}>No scenes yet</span>}
        >
          <For each={scenes()}>
            {(scene) => (
              <button
                class={cx(
                  sceneButtonStyle,
                  activeSceneId() === scene.id && sceneButtonActiveStyle,
                )}
                onClick={() => studio.activateScene(scene.id)}
              >
                {scene.name}
              </button>
            )}
          </For>
        </Show>

        <Button size="sm" variant="ghost" onClick={handleCreate}>
          + Scene
        </Button>
      </div>

      <Button size="sm" variant="ghost" onClick={handleUpdate} disabled={!activeSceneId()}>
        Update
      </Button>
      <Button size="sm" variant="ghost" onClick={handleRemove} disabled={!activeSceneId()}>
        Remove
      </Button>
    </div>
  );
}

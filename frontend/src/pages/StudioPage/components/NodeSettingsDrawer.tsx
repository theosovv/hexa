import { Show, Switch, Match } from "solid-js";

import { css } from "../../../../styled-system/css";
import { useStudio } from "../../../contexts/StudioContext";
import { DelaySettings } from "../../../features/DelaySettings";
import { FilterSettings } from "../../../features/FilterSettings";
import { MasterSettings } from "../../../features/MasterSettings";
import { OscillatorSettings } from "../../../features/OscillatorSettings";
import { ReverbSettings } from "../../../features/ReverbSettings";
import { Drawer } from "../../../uikit";

export function NodeSettingsDrawer() {
  const studio = useStudio();

  const selectedNode = () => {
    const id = studio.selectedNodeId();
    return id ? studio.canvasStore.nodes().get(id) : null;
  };

  const handleClose = () => {
    studio.selectNode(null);
  };

  const updateParam = (key: string, value: number | string) => {
    const node = selectedNode();
    if (!node) return;

    studio.canvasStore.updateNode(node.id, {
      params: { ...node.params, [key]: value },
    });

    studio.audioGraph.updateBlockParam(node.id, key, value);
  };

  return (
    <Drawer
      isOpen={selectedNode() !== null}
      onClose={handleClose}
      title={selectedNode()?.type || "Node Settings"}
      width={360}
    >
      <Show when={selectedNode()}>
        <div class={settingsStyle}>
          <Switch>
            <Match when={selectedNode()!.type === "oscillator"}>
              <OscillatorSettings node={selectedNode()!} onUpdate={updateParam} />
            </Match>

            <Match when={selectedNode()!.type === "filter"}>
              <FilterSettings node={selectedNode()!} onUpdate={updateParam} />
            </Match>

            <Match when={selectedNode()!.type === "delay"}>
              <DelaySettings node={selectedNode()!} onUpdate={updateParam} />
            </Match>

            <Match when={selectedNode()!.type === "reverb"}>
              <ReverbSettings node={selectedNode()!} onUpdate={updateParam} />
            </Match>

            <Match when={selectedNode()!.type === "master"}>
              <MasterSettings node={selectedNode()!} onUpdate={updateParam} />
            </Match>

            <Match when={true}>
              <div class={placeholderStyle}>
                No settings available
              </div>
            </Match>
          </Switch>
        </div>
      </Show>
    </Drawer>
  );
}

const settingsStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
});

const placeholderStyle = css({
  color: "#6b7280",
  fontSize: "14px",
  textAlign: "center",
  padding: "48px 24px",
});

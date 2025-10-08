import { Show, Switch, Match } from "solid-js";

import { placeholderStyle, settingsStyle } from "./styles";
import { useStudio } from "@/contexts/StudioContext";
import { Drawer } from "@/uikit";
import { OscillatorSettings } from "@/features/OscillatorSettings";
import { FilterSettings } from "@/features/FilterSettings";
import { DelaySettings } from "@/features/DelaySettings";
import { ReverbSettings } from "@/features/ReverbSettings";
import { MasterSettings } from "@/features/MasterSettings";
import { SamplerSettings } from "@/features/SamplerSettings";
import { MixerSettings } from "@/features/MixerSettings";

export function NodeSettingsDrawer() {
  const studio = useStudio();

  const selectedNode = () => {
    const id = studio.selectedNodeId();
    return id ? studio.canvasStore.nodes().get(id) : null;
  };

  const handleClose = () => {
    studio.selectNode(null);
  };

  const updateParam = (key: string, value: number | string | boolean) => {
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

            <Match when={selectedNode()!.type === "sampler"}>
              <SamplerSettings node={selectedNode()!} onUpdate={updateParam} />
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

            <Match when={selectedNode()!.type === "mixer"}>
              <MixerSettings node={selectedNode()!} onUpdate={updateParam} />
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

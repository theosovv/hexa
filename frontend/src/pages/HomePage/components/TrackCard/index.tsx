import { useNavigate } from "@solidjs/router";

import {
  badgeStyle,
  cardStyle,
  dateStyle,
  statIconStyle,
  statStyle,
  statTextStyle,
  titleStyle,
} from "./styles";

import type { Track } from "@/api/types/track";
import { Button, Card, Horizontal, Vertical } from "@/uikit";

interface TrackCardProps {
  track: Track;
  onDelete?: (id: string) => void;
}

export function TrackCard(props: TrackCardProps) {
  const navigate = useNavigate();

  const handleOpen = () => {
    navigate(`/studio/${props.track.id}`);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();

    if (confirm(`Delete "${props.track.title}"?`)) {
      props.onDelete?.(props.track.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const nodeCount = () => props.track.graph_data.nodes?.length || 0;
  const connectionCount = () => props.track.graph_data.connections?.length || 0;

  return (
    <Card padding="lg" variant="elevated" class={cardStyle}>
      <Vertical gap="md" fullWidth>
        {/* Header */}
        <Horizontal justify="between" align="start">
          <h3 class={titleStyle}>{props.track.title}</h3>
          <div class={badgeStyle}>{props.track.bpm} BPM</div>
        </Horizontal>

        {/* Stats */}
        <Horizontal gap="md">
          <div class={statStyle}>
            <span class={statIconStyle}>🎵</span>
            <span class={statTextStyle}>{nodeCount()} blocks</span>
          </div>
          <div class={statStyle}>
            <span class={statIconStyle}>🔗</span>
            <span class={statTextStyle}>{connectionCount()} links</span>
          </div>
        </Horizontal>

        {/* Date */}
        <div class={dateStyle}>{formatDate(props.track.updated_at)}</div>

        {/* Actions */}
        <Horizontal gap="sm" fullWidth>
          <Button onClick={handleOpen} variant="primary" size="sm" fullWidth>
            Open
          </Button>
          <Button onClick={handleDelete} variant="ghost" size="sm">
            🗑️
          </Button>
        </Horizontal>
      </Vertical>
    </Card>
  );
}

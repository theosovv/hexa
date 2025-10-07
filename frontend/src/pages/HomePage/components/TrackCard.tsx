import { useNavigate } from "@solidjs/router";
import { css } from "../../../../styled-system/css";
import type { Track } from "../../../api/types/track";
import { Button, Card } from "../../../uikit";

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

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const nodeCount = () => props.track.graph_data.nodes?.length || 0;
  const connectionCount = () => props.track.graph_data.connections?.length || 0;

  return (
    <Card padding="md" class={cardStyle}>
      <div class={headerStyle}>
        <h3 class={titleStyle}>{props.track.title}</h3>
        <div class={badgeStyle}>{props.track.bpm} BPM</div>
      </div>

      <div class={metaStyle}>
        <span class={metaItemStyle}>🎵 {nodeCount()} blocks</span>
        <span class={metaItemStyle}>🔗 {connectionCount()} connections</span>
      </div>

      <div class={dateStyle}>Updated: {formatDate(props.track.updated_at)}</div>

      <div class={actionsStyle}>
        <Button onClick={handleOpen} variant="primary" size="sm" fullWidth>
          Open in Studio
        </Button>
        <Button onClick={handleDelete} variant="ghost" size="sm">
          🗑️
        </Button>
      </div>
    </Card>
  );
}

const cardStyle = css({
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
});

const headerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "12px",
});

const titleStyle = css({
  fontSize: "18px",
  fontWeight: "700",
  margin: 0,
  color: "#1a202c",
});

const badgeStyle = css({
  fontSize: "12px",
  fontWeight: "600",
  padding: "4px 12px",
  background: "#667eea",
  color: "white",
  borderRadius: "12px",
});

const metaStyle = css({
  display: "flex",
  gap: "16px",
  marginBottom: "8px",
});

const metaItemStyle = css({
  fontSize: "13px",
  color: "#718096",
});

const dateStyle = css({
  fontSize: "12px",
  color: "#a0aec0",
  marginBottom: "16px",
});

const actionsStyle = css({
  display: "flex",
  gap: "8px",
});

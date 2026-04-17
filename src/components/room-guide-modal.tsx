import { useState } from "react";
import ROOM_GUIDES from "@/lib/room-guides";

export default function RoomGuideModal({ room, onClose }) {
  if (!room) return null;
  const tips = ROOM_GUIDES[room] || [];
  return (
    <div style={{
      position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, minWidth: 320, boxShadow: "0 8px 32px #0002" }}>
        <h2>{room} Tips & Guides</h2>
        <ul style={{ margin: "16px 0" }}>
          {tips.map((tip, idx) => <li key={idx} style={{ marginBottom: 8 }}>{tip}</li>)}
        </ul>
        <button type="button" onClick={onClose} style={{ marginTop: 12 }}>Close</button>
      </div>
    </div>
  );
}

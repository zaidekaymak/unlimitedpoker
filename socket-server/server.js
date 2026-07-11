const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Tüm oda state'i memory'de tutulur
// rooms: Map<roomId, { id, name, players: Map<playerId, {id,name,hasVoted}>, votes: Map<playerId, value>, revealed }>
const rooms = new Map();

function getRoomState(room) {
  return {
    id: room.id,
    name: room.name,
    revealed: room.revealed,
    players: Object.fromEntries(
      [...room.players.entries()].map(([id, p]) => [id, { id, name: p.name, hasVoted: p.hasVoted }])
    ),
    votes: room.revealed ? Object.fromEntries(room.votes.entries()) : null,
  };
}

function broadcastRoom(room) {
  io.to(room.id).emit("room-state", getRoomState(room));
}

io.on("connection", (socket) => {
  let currentRoomId = null;
  let currentPlayerId = null;

  socket.on("join-room", ({ roomId, playerId, playerName, roomName }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        name: roomName || roomId,
        revealed: false,
        players: new Map(),
        votes: new Map(),
      });
    }

    const room = rooms.get(roomId);
    room.players.set(playerId, { id: playerId, name: playerName, hasVoted: false });

    currentRoomId = roomId;
    currentPlayerId = playerId;

    socket.join(roomId);
    broadcastRoom(room);
  });

  socket.on("vote", ({ roomId, playerId, value }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.votes.set(playerId, value);
    const player = room.players.get(playerId);
    if (player) player.hasVoted = true;

    // Herkes oy verdiyse otomatik aç
    const allVoted =
      room.players.size > 0 && [...room.players.values()].every((p) => p.hasVoted);
    if (allVoted) room.revealed = true;

    broadcastRoom(room);
  });

  socket.on("reveal", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.revealed = true;
    broadcastRoom(room);
  });

  socket.on("reset", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.revealed = false;
    room.votes.clear();
    room.players.forEach((p) => (p.hasVoted = false));
    broadcastRoom(room);
  });

  socket.on("emoji", ({ roomId, targetId, emoji }) => {
    socket.to(roomId).emit("emoji", { targetId, emoji });
  });

  socket.on("disconnect", () => {
    if (!currentRoomId || !currentPlayerId) return;
    const room = rooms.get(currentRoomId);
    if (!room) return;
    room.players.delete(currentPlayerId);
    if (room.players.size === 0) {
      rooms.delete(currentRoomId);
    } else {
      broadcastRoom(room);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

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

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);
  });

  // Bir client DB'ye yazdı, odadakilere haber ver
  socket.on("sync", (roomId) => {
    socket.to(roomId).emit("sync");
  });

  // Emoji relay
  socket.on("emoji", ({ roomId, targetId, emoji }) => {
    socket.to(roomId).emit("emoji", { targetId, emoji });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.io server running on port ${PORT}`);
});

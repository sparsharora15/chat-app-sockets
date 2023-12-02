const { Server } = require("socket.io");

const userId = {};
const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connect", (socket) => {
  if (socket.handshake.query.userId) {
    userId[socket.handshake.query.userId] = socket.id;
    console.log("Active Users:", userId);
  }

  // Handle socket events here...

  socket.on("sendMessage", (message) => {
    console.log("receiveNewMessage", message);
    io.to(userId[message.receiver]).emit("receiveNewMessage", message);
  });
  // socket.on("sendRequest", (data) => {
  //   console.log("sendRequest", data);
  //   // io.to(userId[message.receiver]).emit("receiveNewMessage", message);
  // });
  socket.on("notification", (notification) => {
    console.log("receiveNewnotification", notification);
    io.to(userId[notification.friendId]).emit(
      "receiveNewnotification",
      notification
    );
  });
  socket.on("sendFriendRequest", (friendRequest) => {
    io.to(userId[friendRequest.friendId]).emit("receiveNewFriendRequest", friendRequest);
  });


  socket.on("acceptFriendRequest", (friendRequest) => {
    console.log("friendRequestAccepted", friendRequest);
    io.to(userId[friendRequest.friendId]).emit("friendRequestAccepted", friendRequest);
  });
  
  socket.on("startTyping", (data) => {
    console.log(data);
    io.to(userId[data.typingStatusReceiver]).emit("userTyping", data.senderId);
  });

  socket.on("stopTyping", (data) => {
    io.to(userId[data.typingStatusReceiver]).emit(
      "userStoppedTyping",
      data.senderId
    );
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    Object.keys(userId).forEach((el) => {
      if (userId[el] === socket.id) {
        delete userId[el];
        console.log("Active Users:", userId);
      }
    });
  });
});

io.listen(3000, () => {
  console.log("Socket.IO server is running on port 3000");
});

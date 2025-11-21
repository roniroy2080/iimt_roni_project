let socket = io("https://iimt-practice.onrender.com/");
var messageInput = document.getElementById("messageInput");
let toast_text = document.getElementById("snackbar");

let username = localStorage.getItem("NAME");
let room_id = localStorage.getItem("ROOM-ID");
let room_password = localStorage.getItem("ROOM_PASSWORD");
let IsLogin = localStorage.getItem("Login_True");
let myRoom_ID = room_id + room_password;

let delete_localstorage_data = () => {
  localStorage.removeItem("NAME");
  localStorage.removeItem("ROOM-ID");
  localStorage.removeItem("ROOM_PASSWORD");
  localStorage.removeItem("Login_True");
};

window.onbeforeunload = (e) => {
  e.preventDefault();

  return "Sure?";
};

function connection_start() {
  if (IsLogin != "True") {
    socket.emit("joining:room", { myRoom_ID, username });
    localStorage.setItem("Login_True", "True");
  }
}

if (!username && !room_id && !room_password) {
  window.location.href = "index.html";
} else {
  connection_start();
}

let online_add = (username1) => {
  let div = document.createElement("div");
  div.style.marginLeft = "0.75rem";
  div.style.marginTop = "-1rem";

  let h4 = document.createElement("h4");
  h4.innerHTML = username1;

  let div1 = document.createElement("div");
  div1.style.display = "flex";
  div1.style.alignItems = "center";
  div1.style.textAlign = "center";
  div1.style.gap = "1rem";
  div1.style.marginTop = "-1.75rem";

  let p = document.createElement("p");
  p.style.color = "green";
  p.innerHTML = "Online";

  let div2 = document.createElement("div");
  div2.style.height = "10px";
  div2.style.width = "10px";
  div2.style.borderRadius = "50%";
  div2.style.background = "rgb(66, 228, 2)";

  div.appendChild(h4);
  div1.appendChild(p);
  div1.appendChild(div2);
  div.appendChild(div1);

  document.querySelector(".online").append(div);
};

socket.on("I:Joined:room", () => {
  online_add(username + "(You)");
});

socket.on("other:Joined:room", (username_got) => {
  online_add(username + "(You)");
  online_add(username_got);
});

function messagee(data) {
  var chatMessages = document.getElementById("chatMessages");
  var message = document.createElement("div");
  message.className = "message";
  message.innerHTML =
    '<span class="user">Others : </span><div class="content">' +
    data +
    '</div><span class="timestamp">' +
    getCurrentTime() +
    "</span>";
  chatMessages.appendChild(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

socket.on("message:client", (data) => {
  messagee(data);
});

let socket_joining_function = () => {
  if (myRoom_ID && username) {
    socket.emit("joining:room", {
      myRoom_ID,
      username,
    });
  } else {
    alert("Session Expire ...");
  }

  socket.on("I:Joined:room", () => {
    online_add(username + "(You)");
  });

  socket.on("message:client", (msg_received) => {
    console.alert(msg_received);
  });

  socket.on("other:Joined:room", (username_got) => {
    online_add(username_got);
  });

  socket.on("other:joined:success", () => {
    socket.emit("other:username", {
      username,
      myRoom_ID,
    });
  });

  socket.on("other:username:client", (username_g) => {
    online_add(username_g);
  });

  socket.on("full:room", () => {
    toast_text.innerHTML = `Room Full`;
    toast();
  });
};

// socket_joining_function();

document.getElementById("leave_room_btn").onclick = () => {
  window.location.href = "index.html";
  delete_localstorage_data();
};

function sendMessage() {
  if (messageInput.value.trim() !== "") {
    var message = document.createElement("div");
    message.className = "message";
    message.innerHTML =
      '<span class="user">You:</span><div class="content">' +
      messageInput.value +
      '</div><span class="timestamp">' +
      getCurrentTime() +
      "</span>";
    chatMessages.appendChild(message);

    // socket.emit("message", {
    //   to: myRoom_ID,
    //   msg: messageInput.value,
    // });

    socket.emit("message_send", {
      to: myRoom_ID,
      msg: messageInput.value,
    });

    messageInput.value = "";
  }
}

function getCurrentTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var currentTime = hours + ":" + minutes + " " + ampm;
  return currentTime;
}

function openNav() {
  document.getElementById("sidebar").style.left = "0";
  document.getElementById("open_nav").style.right = "-13rem";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("sidebar").style.left = "-250px";
  document.getElementById("open_nav").style.right = "0";
  document.getElementById("main").style.marginLeft = "0";
}

socket.on("disconnected", function () {
  console.log("disconnect client event....");
});

socket.off("disconnect");
socket.off("server-message");
socket.off("server-update");


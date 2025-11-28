let configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
let peerConnection = new RTCPeerConnection(configuration);
let socket = null;
let datachannel = peerConnection.createDataChannel("msg");

let user_joined_name = localStorage.getItem("NAME");
let user_joined_password = localStorage.getItem("PASSWORD");
let user_joined_room_ID = localStorage.getItem("ROOM-ID");

document.getElementById("room_detail_name_modal").innerHTML =
  user_joined_name || "NO NAME";
document.getElementById("room_detail_room_id_modal").innerHTML =
  user_joined_room_ID;
document.getElementById("room_detail_password_modal").innerHTML =
  user_joined_password;

let MY_ROOM_ID = user_joined_room_ID + user_joined_password;
let OTHERS_ROOM_ID;
let Successfully_joined_room_by_local_user;
let i_joined_success_return_from_socket = false;
let My_uuid;
let local_video_stream;

let toast_text = document.getElementById("snackbar");
let Remote_username;

document.getElementById("logout_room").onclick = () => {
  localStorage.removeItem("NAME");
  localStorage.removeItem("PASSWORD");
  localStorage.removeItem("ROOM-ID");
  window.location.href = "index.html";
};

let checking_ISLOGIN = () => {
  if (
    !localStorage.getItem("NAME") &&
    !localStorage.getItem("PASSWORD") &&
    !localStorage.getItem("ROOM-ID")
  ) {
    window.location.href = "index.html";
  }
};

checking_ISLOGIN();

let room_joining_modal_btn = document.getElementById("room_joining_modal_btn");
let room_joined_by_own_id_pass_btn = document.getElementById(
  "room_joining_by_own_id_btn"
);
let join_room_close_modal_btn = document.getElementById(
  "join_room_close_modal_btn"
);
let leave_room_btn = document.getElementById("leave_room_btn");
let leave_modal_room_id = document.getElementById("leave_room_id_modal");
let local_user_join_or_not = document.getElementById("local_user_join_or_not");
let other_joined_or_not = document.getElementById("other_joined_or_not");
let call_btn = document.getElementById("call_btn");
let msg_part = document.getElementById("message_part_get_send");
let loading_on_call_btn = document.getElementById("loading_on_call_btn");
let call_incoming_alert = document.getElementById("call_incoming_alert");
let mute_btn = document.getElementById("mute_btn");
let stream_stop_btn = document.getElementById("stream_stop_btn");
let msg_send_btn = document.getElementById("msg_send_btn_modal");

let local_video = document.getElementById("local_video");
let Remote_video = document.getElementById("Remote_video");

let generate_random_num = () => {
  (_sym = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"),
    (str = "");
  for (var i = 0; i < 50; i++) {
    str += _sym[parseInt(Math.random() * _sym.length)];
  }
  return str;
};

room_joining_modal_btn.addEventListener("click", () => {
  var room_id = document.getElementById("room__join_modal");
  room_id = room_id.value.trim();
  var room_password = document.getElementById("room__password_join_modal");
  room_password = room_password.value.trim();

  if (room_id.length > 0 && room_password.length > 0) {
    if (
      !Successfully_joined_room_by_local_user ||
      i_joined_success_return_from_socket == false
    ) {
      socket = io("https://iimtback.vercel.app");
      document.getElementById("room__join_modal").value = null;
      document.getElementById("room__password_join_modal").value = null;
      OTHERS_ROOM_ID = room_id + room_password;

      My_uuid = generate_random_num();

      socket.emit("joining:room", {
        to: OTHERS_ROOM_ID,
        name: user_joined_name,
        uuid: My_uuid,
      });

      Successfully_joined_room_by_local_user = OTHERS_ROOM_ID;
      join_room_close_modal_btn.click();
      socket_functions();
      prevent_reload();
    } else {
      toast_text.innerHTML = "You Are Already Joined To A Room";
      toast();
    }
  } else {
    alert("Enter Room-ID & Password");
  }
});

room_joined_by_own_id_pass_btn.onclick = () => {
  if (
    !Successfully_joined_room_by_local_user ||
    i_joined_success_return_from_socket == false
  ) {
    socket = io("https://iimtback.vercel.app");
    document.getElementById("room__join_modal").value = null;
    document.getElementById("room__password_join_modal").value = null;

    My_uuid = generate_random_num();
    socket.emit("joining:room", {
      to: MY_ROOM_ID,
      name: user_joined_name,
      uuid: My_uuid,
    });
    join_room_close_modal_btn.click();
    Successfully_joined_room_by_local_user = MY_ROOM_ID;

    socket_functions();
    prevent_reload();
  } else {
    toast_text.innerHTML = "You Are Already Joined To A Room";
    toast();
  }
};

let disabled_after_joined_room = (room_id_) => {
  room_joining_modal_btn.disabled = "true";
  room_joined_by_own_id_pass_btn.disabled = "true";
  My_uuid = "";
  leave_room_btn.disabled = "";
  leave_modal_room_id.innerHTML = room_id_;
};

datachannel.onopen = () => {
  msg_send_btn.disabled = "";
  document.getElementById("msg_input_modal").disabled = "";
};

datachannel.onclose = () => {
  document.getElementById("msg_input_modal").disabled = "true";
  msg_send_btn.disabled = "true";
};

let somebody_leave_room_from_other_end = () => {
  toast_text.innerHTML = `${Remote_username} Leave Room`;
  toast();

  if (local_video_stream) {
    local_video_stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  local_video_stream = null;
  peerConnection.ontrack = null;
  local_user_join_or_not.innerHTML = "Disconnected";
  other_joined_or_not.innerHTML = `${Remote_username} Leave`;

  peerConnection.close();
  socket.disconnect();
  datachannel.close();

  document.getElementById("local_video").srcObject = null;
  document.getElementById("Remote_video").srcObject = null;

  configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  peerConnection = new RTCPeerConnection(configuration);

  leave_room_btn.disabled = "true";
  room_joining_modal_btn.disabled = "";
  room_joined_by_own_id_pass_btn.disabled = "";
  Successfully_joined_room_by_local_user = "";

  mute_btn.disabled = "true";
  call_btn.disabled = "true";
  stream_stop_btn.disabled = "true";
  leave_modal_room_id.innerHTML = "No Data";
};

datachannel.onclosing = () => {
  somebody_leave_room_from_other_end();
};

leave_room_btn.onclick = () => {
  if (Successfully_joined_room_by_local_user) {
    stream_stop_btn.disabled = "";
    mute_btn.disabled = "";
    leave_modal_room_id.innerHTML = "No Data";
    toast_text.innerHTML = "Exist Room Successfully";
    toast();
    document.getElementById("leave_room_close_modal_btn").click();
    leave_room_btn.disabled = "true";
    room_joining_modal_btn.disabled = "";
    room_joined_by_own_id_pass_btn.disabled = "";
    Successfully_joined_room_by_local_user = null;

    if (local_video_stream) {
      local_video_stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    document.getElementById("local_video").srcObject = null;
    document.getElementById("Remote_video").srcObject = null;

    local_video_stream = null;
    peerConnection.ontrack = null;
    datachannel.close();
    peerConnection.close();
    call_btn.disabled = "true";
    local_user_join_or_not.innerHTML = "Leave Room";
    document.querySelector(".lds-facebook").style.display = "none";
    other_joined_or_not.innerHTML = "NO USER";
    socket.disconnect();

    configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
    peerConnection = new RTCPeerConnection(configuration);
  } else {
    toast_text.innerHTML = "You Not Joined Any Room";
    toast();
  }
};

let prevent_reload = () => {
  window.onbeforeunload = (e) => {
    e.preventDefault();

    return "Sure?";
  };
};

let getOffer = async () => {
  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  return offer;
};

let getAnswer = async (offer) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  let ans = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(ans);
  return ans;
};

let streaming = async () => {
  const constraints = (window.constraints = {
    audio: true,
    video: true,
  });

  let stream = await navigator.mediaDevices.getUserMedia(constraints);

  local_video_stream = stream;

  let local_video = document.getElementById("local_video");
  local_video.srcObject = local_video_stream;
  return "accepted";
};

let sharing_stream = () => {
  local_video_stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, local_video_stream);
  });
};

peerConnection.ontrack = (streaming_getting) => {
  let Remote_video = document.getElementById("Remote_video");
  Remote_video.srcObject = streaming_getting.streams[0];
};

let socket_functions = () => {
  socket.on("room:full", (uuid) => {
    if (My_uuid !== "") {
      if (uuid == My_uuid) {
        toast_text.innerHTML = "Room Full !!";
        toast();
      } else {
        toast_text.innerHTML = "Something Went Wrong";
        toast();
      }
    }
  });

  socket.on("i:joined:successfully", () => {
    i_joined_success_return_from_socket == true;
    toast_text.innerHTML = `Successfully Joined Room ${Successfully_joined_room_by_local_user}`;
    toast();

    disabled_after_joined_room(Successfully_joined_room_by_local_user);

    local_user_join_or_not.innerHTML = "Joined";
    document.querySelector(".lds-facebook").style.display = "block";
  });

  socket.on("other:joined:room", async (name) => {
    Remote_username = name;
    other_joined_or_not.innerHTML = `${name} Joined`;
    document.getElementById("call_incoming_user_name").innerHTML = name;
    let offer = await getOffer();
    socket.emit("other:joined:success", {
      to: Successfully_joined_room_by_local_user,
      name: user_joined_name,
      offer,
    });
    document.querySelector(".lds-facebook").style.display = "none";

    toast_text.innerHTML = `You Are Connected To ${name}`;
    toast();
    call_btn.disabled = "";
  });

  socket.on("other:joined:room:success", async (name_get) => {
    disabled_after_joined_room(Successfully_joined_room_by_local_user);
    i_joined_success_return_from_socket == true;
    let { name, offer } = name_get;

    Remote_username = name;

    local_user_join_or_not.innerHTML = "Joined";
    other_joined_or_not.innerHTML = `${name} Joined`;
    document.getElementById("call_incoming_user_name").innerHTML = name;

    toast_text.innerHTML = `You Are Connected To ${name}`;
    toast();

    let answer = await getAnswer(offer);
    call_btn.disabled = "";

    socket.emit("answer:server", {
      to: Successfully_joined_room_by_local_user,
      answer,
    });
  });

  socket.on("answer:client", async (answer) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  });

  socket.on("nego:offer:client", async (offer_nego) => {
    let answer = await getAnswer(offer_nego);
    socket.emit("nego:answer:server", {
      to: Successfully_joined_room_by_local_user,
      answer,
    });
  });

  socket.on("nego:answer:client", async (answer) => {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
    return socket.off("nego:answer:client");
  });
};

call_btn.onclick = async () => {
  loading_on_call_btn.style.display = "block";
  call_btn.disabled = "true";

  try {
    let stream_a = await streaming();

    if (stream_a == "accepted") {
      datachannel.send(
        JSON.stringify({
          code: "calling_user_other_____",
        })
      );
    }
  } catch (error) {
    loading_on_call_btn.style.display = "none";
    call_btn.disabled = "";
  }
};

let call_reject_btn = document.getElementById("call_reject_btn");
let call_accept_btn = document.getElementById("call_accept_btn");
let call_incoming_now;

let share_mute_btn_disable_false = () => {
  stream_stop_btn.disabled = "";
  mute_btn.disabled = "";
};

call_accept_btn.onclick = async () => {
  if (call_incoming_now) {
    call_incoming_now = false;

    try {
      let stream_aa = await streaming();

      if (stream_aa == "accepted") {
        call_incoming_alert.style.display = "none";
        call_btn.disabled = "true";
        sharing_stream();
        share_mute_btn_disable_false();
        datachannel.send(
          JSON.stringify({
            code: "call__accepted_by_user_other_____",
          })
        );
      }
    } catch (error) {
      call_not_accepted("Stream Does Not Share");
      call_incoming_alert.style.display = "none";
      call_btn.disabled = "";
    }
  }
};

call_reject_btn.onclick = () => {
  if (call_incoming_now) {
    call_incoming_now = false;
    call_btn.disabled = "";
    call_not_accepted("Call Rejected");
    call_incoming_alert.style.display = "none";
  }
};

let call_incoming = () => {
  call_incoming_now = true;
  call_incoming_alert.style.display = "flex";
  call_btn.disabled = "true";

  setTimeout(() => {
    if (call_incoming_now == true) {
      call_incoming_now = false;
      call_btn.disabled = "";
      call_not_accepted("Call Not PickUp !!");
      call_incoming_alert.style.display = "none";
    }
  }, 10000);
};

let call_not_accepted = (message_) => {
  datachannel.send(
    JSON.stringify({
      code: "call_not_accepted_by_user_other_____",
      reason: message_,
    })
  );
};

let call_accepted = async () => {
  share_mute_btn_disable_false();
  setTimeout(() => {
    sharing_stream();
  }, 1500);
  toast_text.innerHTML = `Call Accepted`;
  toast();
  loading_on_call_btn.style.display = "none";
  call_btn.disabled = "true";
};

let call_rejected = (reason) => {
  toast_text.innerHTML = `${reason}`;
  toast();

  loading_on_call_btn.style.display = "none";
  call_btn.disabled = "";
};

peerConnection.ondatachannel = (e) => {
  if (datachannel.readyState == "open") {
    let receive_ = e.channel;
    receive_.onmessage = (event) => {
      let msg_name_get = JSON.parse(event.data);

      if (msg_name_get.code == "msg_box_focus") {
        let p = document.createElement("p");
        p.innerHTML = `
                <p id='focus_msg_box'><span style="font-weight: 400;color: red;">${msg_name_get.to}</span> : <span style="line-height: 1.25rem;">Typing ....</span></p>
                `;
        msg_part.prepend(p);
      } else if (msg_name_get.code == "msg_box_blur") {
        if (document.getElementById("focus_msg_box")) {
          document.getElementById("focus_msg_box").remove();
        }
      } else if (msg_name_get.code == "calling_user_other_____") {
        call_incoming();
      } else if (msg_name_get.code == "call_not_accepted_by_user_other_____") {
        call_rejected(msg_name_get.reason);
      } else if (msg_name_get.code == "call__accepted_by_user_other_____") {
        call_accepted();
      } else {
        let p = document.createElement("p");
        p.innerHTML = `
                <p><span style="font-weight: 900;color: red;">${msg_name_get.to}</span> : <span style="line-height: 1.25rem;">${msg_name_get.msg}</span></p>
                `;
        msg_part.prepend(p);
      }
    };
  } else {
    alert("Something Went Wrong. Please Refresh Page !");
  }
};

peerConnection.onnegotiationneeded = async () => {
  try {
    let offer = await getOffer();
    socket.emit("nego:offer:server", {
      to: Successfully_joined_room_by_local_user,
      offer,
    });
  } catch (error) {}
};

document.getElementById("msg_input_modal").onfocus = () => {
  datachannel.send(
    JSON.stringify({
      code: "msg_box_focus",
      to: user_joined_name,
    })
  );

  document.getElementById("msg_input_modal").onblur = () => {
    datachannel.send(
      JSON.stringify({
        code: "msg_box_blur",
        to: user_joined_name,
      })
    );
  };
};

msg_send_btn.onclick = () => {
  let msg = document.getElementById("msg_input_modal");
  msg = msg.value.trim();

  if (datachannel.readyState == "open") {
    if (msg.length > 0) {
      let p = document.createElement("p");
      p.innerHTML = `
            <p><span style="font-weight: 900;color: blue;">ME</span> : <span style="line-height: 1.25rem;">${msg}</span></p>
            `;
      msg_part.prepend(p);

      datachannel.send(
        JSON.stringify({
          msg,
          to: user_joined_name,
        })
      );

      document.getElementById("msg_input_modal").value = null;
    } else {
      alert("Please Enter Message ...");
    }
  } else {
    alert("Not Connected To Anyone");
  }
};

let isMute = false;

mute_btn.onclick = () => {
  if (local_video_stream) {
    local_video_stream.getTracks().forEach((track) => {
      if (track.kind == "audio") {
        isMute = !isMute;
        if (isMute) {
          mute_btn.innerHTML = "UnMute";

          track.enabled = false;
        } else {
          track.enabled = true;
          mute_btn.innerHTML = "Mute";
        }
      }
    });
  } else {
    toast_text.innerHTML = "Your Stream Does Not Exist";
    toast();
  }
};

let isSTREAM = true;
stream_stop_btn.onclick = () => {
  if (local_video_stream) {
    local_video_stream.getVideoTracks().forEach((track) => {
      isSTREAM = !isSTREAM;
      if (isSTREAM) {
        stream_stop_btn.innerHTML = "STOP STREAM";
        track.enabled = true;
      } else {
        stream_stop_btn.innerHTML = "SHARE STREAM";

        track.enabled = false;
      }
    });
  } else {
    toast_text.innerHTML = "Your Stream Does Not Exist";
    toast();
  }
};



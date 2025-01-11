"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocalCamera } from "@/hooks/useLocalCamera";
import { Box, Input, Text, VStack } from "@chakra-ui/react";
import startCall from "../api/webRTC/startCall";
import postRoom from "../api/sdp/postRoom";

export default function Host() {
  const { stream, videoRef } = useLocalCamera();
  const [roomID, setRoomID] = useState<string>("");
  const [description, setDescription] =
    useState<RTCSessionDescriptionInit | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>();
  const [name, setName] = useState<string>("");

  // WebSocketのインスタンスを作成
  const [ws, setWs] = useState<WebSocket | null>(null);

  // roomIDが払い出されたタイミングでWebSocketの接続を確立
  useEffect(() => {
    if (!roomID) return;

    const socket = new WebSocket(
      "ws://localhost:9999/connect?roomID=" + roomID
    );
    setWs(socket);

    socket.onopen = () => {
      if (roomID && description) {
        socket.send(
          JSON.stringify({
            type: "offer",
            roomID,
            sendFrom: "host",
            description,
          })
        );
      }

      // ICE Candidateの送信
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.send(
            JSON.stringify({
              type: "candidate",
              roomID,
              sendFrom: "host",
              description: event.candidate,
            })
          );
          console.log("Sent ICE candidate:", event.candidate);
        }
      };
      console.log(
        "WebSocket connection established and send offer to SDP server"
      );
    };

    socket.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    socket.onmessage = (event) => {
      const json_data = JSON.parse(event.data);

      console.log(json_data);

      if (json_data.type === "answer" && json_data.sdp) {
        console.log("Received answer from SDP server");
        peerConnection?.setRemoteDescription(json_data);
      }

      if (
        json_data.type == "candidate" &&
        json_data.sendFrom == "client" &&
        json_data.description // TODO description = candidateに変えたい
      ) {
        console.log("Received ICE candidate from client");
        peerConnection?.addIceCandidate(json_data.description);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, [roomID]);

  return (
    <Box m={[10, 5]}>
      <video ref={videoRef} autoPlay playsInline />
      <Box m={6} />
      <VStack alignItems={"flex-start"} justifyContent={"space-around"}>
        <Text fontSize="m">Enter your name:</Text>
        <Input
          w={"1/2"}
          placeholder="Name"
          onChange={(v) => {
            setName(v.currentTarget.value);
          }}
        />
        <Box m={3} />
        <Button
          disabled={roomID !== "" && description !== null}
          onClick={async () => {
            const roomID = await postRoom(name);
            const result = await startCall(stream);
            setRoomID(roomID);
            setDescription(result.offerDescription);
            setPeerConnection(result.localPeer);
          }}
        >
          Start Call
        </Button>
        {roomID && description && (
          <Text fontSize="m">
            Your RoomID is{" "}
            <Text as="span" fontWeight="bold">
              {roomID}
            </Text>
            . Share this ID with your friend.
          </Text>
        )}
      </VStack>
    </Box>
  );
}

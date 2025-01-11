"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Box, Input, Text, VStack } from "@chakra-ui/react";
import { describe } from "node:test";

export default function Join() {
  const [roomID, setRoomID] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isWsOpen, setIsWsOpen] = useState<boolean>(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const handleJoinCall = () => {
    if (!roomID) return;

    const socket = new WebSocket(
      "ws://localhost:9999/connect?roomID=" + roomID
    );
    setWs(socket);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      socket.send(
        JSON.stringify({
          type: "join",
          roomID,
          sendFrom: "client",
          description: {},
        })
      );

      const newPeerConnection = new RTCPeerConnection();

      // 映像受信した時のイベント
      newPeerConnection.ontrack = (event) => {
        const videoElement = document.getElementById(
          "remote-video"
        ) as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = event.streams[0];
        } else {
          console.error("Video element not found");
        }
      };

      // ICE Candidateの送信
      newPeerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.send(
            JSON.stringify({
              type: "candidate",
              roomID,
              sendFrom: "client",
              description: event.candidate,
            })
          );
          console.log("Sent ICE candidate:", event.candidate);
        }
      };

      peerConnectionRef.current = newPeerConnection;

      setIsWsOpen(true);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    socket.onmessage = async (event) => {
      if (event.data === "配信が存在しません") {
        alert("配信が存在しません");
        return;
      }

      const json_data = JSON.parse(event.data);

      if (
        json_data.type === "offer" &&
        json_data.sdp &&
        peerConnectionRef.current
      ) {
        console.log("Received offer from host");

        // Remote Descriptionの設定
        await peerConnectionRef.current.setRemoteDescription(json_data);

        // Answerの作成
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);

        // Answerを送信
        socket.send(
          JSON.stringify({
            type: "answer",
            roomID,
            sendFrom: "client",
            description: answer,
          })
        );
      }

      if (
        json_data.type == "candidate" &&
        json_data.sendFrom == "host" &&
        json_data.description && // TODO description = candidateに変えたい
        peerConnectionRef.current
      ) {
        console.log("Received ICE candidate from host");
        peerConnectionRef.current.addIceCandidate(json_data.description);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsWsOpen(false);
    };
  };

  return (
    <Box m={[10, 5]}>
      <video id="remote-video" autoPlay playsInline></video>
      <VStack alignItems={"flex-start"} justifyContent={"space-around"}>
        <Text fontSize="m">Enter Room ID:</Text>
        <Input
          w={"1/2"}
          disabled={isWsOpen}
          placeholder="Room ID"
          onChange={(v) => {
            setRoomID(v.currentTarget.value);
          }}
        />
        <Box m={3} />
        <Button disabled={!roomID || isWsOpen} onClick={handleJoinCall}>
          Join Call
        </Button>
      </VStack>
    </Box>
  );
}

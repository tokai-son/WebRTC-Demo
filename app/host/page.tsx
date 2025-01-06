"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocalCamera } from "@/hooks/useLocalCamera";
import { Box, Input, Text, VStack } from "@chakra-ui/react";
import startCall from "../api/webRTC/startCall";
import postRoom from "../api/sdp/postRoom";
import { AiOutlineConsoleSql } from "react-icons/ai";

export default function Host() {
  const { stream, videoRef } = useLocalCamera();
  const [roomID, setRoomID] = useState<string>("");
  const [description, setDescription] =
    useState<RTCSessionDescriptionInit | null>(null);
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
        socket.send(JSON.stringify({ type: "offer", roomID, description }));
      }
      console.log(
        "WebSocket connection established and send offer to SDP server"
      );
    };

    socket.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    socket.onmessage = (event) => {
      console.log("Message from server ", event.data); // A type of received message should be "answer"
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
            const description = await startCall(stream);
            setRoomID(roomID);
            setDescription(description);
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

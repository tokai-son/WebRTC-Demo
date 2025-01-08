"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Box, Input, Text, VStack } from "@chakra-ui/react";

export default function Join() {
  const [roomID, setRoomID] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isWsOpen, setIsWsOpen] = useState<boolean>(false);

  const handleJoinCall = () => {
    if (!roomID) return;

    const socket = new WebSocket(
      "ws://localhost:9999/connect?roomID=" + roomID
    );
    setWs(socket);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      setIsWsOpen(true);
      socket.send(JSON.stringify({ type: "join", roomID }));
    };

    socket.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    socket.onmessage = (event) => {
      console.log("Message from server ", event.data);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsWsOpen(false);
    };
  };

  return (
    <Box m={[10, 5]}>
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

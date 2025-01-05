"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocalCamera } from "@/hooks/useLocalCamera";
import { Box, Input, Text, VStack } from "@chakra-ui/react";

export default function Host() {
  const { videoRef } = useLocalCamera();
  const [sessionID, setSessionID] = useState<string>("");
  const [name, setName] = useState<string>("");

  return (
    <Box m={[10, 5]}>
      <h1>Host page</h1>
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
          onClick={() => {
            setSessionID("TEMP_ID_" + name + "_" + new Date().getTime());
          }}
        >
          Create Session
        </Button>
        <Text fontSize="m">{sessionID}</Text>
      </VStack>
    </Box>
  );
}

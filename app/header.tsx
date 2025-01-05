"use client";

import { Box, Flex, Heading, Spacer, Button } from "@chakra-ui/react";

export function Header() {
  return (
    <Box
      as="header"
      px={5}
      py={5}
      borderBottom={"2px solid"}
      borderColor={"whiteAlpha.900"}
    >
      <Flex align="center">
        <Heading size="md">WebRTC Demo</Heading>
      </Flex>
    </Box>
  );
}

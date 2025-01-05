import { Button } from "@/components/ui/button";
import { HStack, Link } from "@chakra-ui/react";

export default function Home() {
  return (
    <HStack m={[10, 5]}>
      <Link href="/host">
        <Button>Host</Button>
      </Link>
      <Link href="/client">
        <Button>Client</Button>
      </Link>
    </HStack>
  );
}

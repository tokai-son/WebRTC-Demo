import axios from "axios";

export default async function postRoom(name: string): Promise<string> {
  try {
    const response = await axios.post(
      "http://localhost:9999/room",
      {
        name,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status !== 200) {
      throw new Error("Failed to post to /room");
    }

    return response.data.roomID as string;
  } catch (error) {
    console.error("Error posting to /room:", error);
  }
}

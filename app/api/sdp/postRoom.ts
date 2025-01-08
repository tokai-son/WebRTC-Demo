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
    return response.data.roomID as string;
  } catch (error) {
    alert(error.response?.data?.error);
    return "";
  }
}

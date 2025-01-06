export default async function startCall(
  mediaStream: MediaStream
): Promise<RTCSessionDescriptionInit> {
  const localPeer = new RTCPeerConnection();

  // MediaStreamの追加
  mediaStream.getTracks().forEach((track) => {
    localPeer.addTrack(track, mediaStream);
  });

  // Offerの作成
  const offerDescription = await localPeer.createOffer();

  // LocalDescriptionの設定
  await localPeer.setLocalDescription(offerDescription);

  return offerDescription;
}

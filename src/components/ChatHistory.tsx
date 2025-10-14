import {useTranscriptions} from "@livekit/components-react";

export default function ChatHistory() {
  const transcriptions = useTranscriptions();
  return <ul className="min-h-24 h-fit bg-gray-800 rounded-lg p-1 flex gap-1 flex-col">
    {transcriptions.slice(Math.max(transcriptions.length - 5, 0)).map((transcription) => {
      return <li key={transcription.streamInfo.id} className="flex flex-col rounded-lg gap-[8px] p-[8px] bg-white">
        <h3>{transcription.participantInfo.identity}</h3>
        <p>{transcription.text}</p>
      </li>
    })}
  </ul>
}
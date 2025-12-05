import { Languages, Mic } from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAgentRemoteRpcMethod } from "@/lib/hooks/agent";
import { useLiveKit } from "@/lib/stores/livekit";
import { trpc } from "@/lib/trpc";

export default function VoiceModelSettings() {
  const { data: voices } = trpc.voices.getVoices.useQuery();
  const setRemoteVoiceId = trpc.voices.setCurrentVoice.useMutation();
  const { voiceId, setVoiceId } = useLiveKit();

  const setAgentVoice = useAgentRemoteRpcMethod(
    "set_voice",
    z.object({ voiceId: z.string() }),
    z.object({}),
  );

  const setSelectedVoiceId = async (newVoiceId: string) => {
    const prevVoiceId = voiceId;
    setVoiceId(newVoiceId);
    await setRemoteVoiceId.mutateAsync({ voiceId: newVoiceId });
    try {
      await setAgentVoice({ voiceId: newVoiceId });
    } catch (error) {
      console.error("Failed to set agent voice:", error);
      setVoiceId(prevVoiceId);

      if (!prevVoiceId) {
        return;
      }

      await setRemoteVoiceId.mutateAsync({ voiceId: prevVoiceId });
    }
  };

  if (!voices) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <Mic className="w-4 h-4 text-teal-600" />
        <h3 className="font-semibold text-sm">Voice Model Settings</h3>
      </div>

      <div className="space-y-2">
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Current Voice
          </h3>
          <Select
            value={voiceId}
            onValueChange={(value) => setSelectedVoiceId(value)}
          >
            <SelectTrigger className="w-full h-auto p-2 bg-muted/50 border-border">
              {(voiceId && (
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-xs flex-shrink-0">
                    {voices[voiceId].displayName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {voices[voiceId].displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Natural • Professional
                    </p>
                  </div>
                </div>
              )) || <span>Loading...</span>}
            </SelectTrigger>
            <SelectContent>
              {Object.entries(voices).map(([id, model]) => (
                <SelectItem key={id} value={id}>
                  {model.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Languages className="w-3 h-3 text-muted-foreground" />
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Supported Languages
            </h3>
          </div>
          {(voiceId && (
            <ScrollArea className="h-[120px] pr-2">
              <div className="flex flex-wrap gap-1.5">
                {voices[voiceId].supportedLanguages.map((lang) => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 bg-background border-border hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors cursor-default"
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          )) || <div>Loading...</div>}
        </div>
      </div>
    </div>
  );
}

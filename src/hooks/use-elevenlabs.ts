
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useElevenLabs = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default voice ID for ElevenLabs (Sarah voice)
  const voiceId = "EXAVITQu4vr4xnSDxMaL"; 
  
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsLoading(true);
      stopSpeaking();
      
      // Create a new audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Call ElevenLabs API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY || ''
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      audio.src = url;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      
      await audio.play();
      
      return true;
    } catch (error) {
      console.error('Error during text-to-speech:', error);
      toast({
        title: "Text-to-speech failed",
        description: "Failed to convert text to speech. Please check your API key and try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    speakText,
    stopSpeaking,
    isLoading
  };
};

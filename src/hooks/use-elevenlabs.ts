
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
          // Using XI-API-KEY as a query parameter for this example, but in production
          // you should use env variables or a backend function to protect your API key
          'xi-api-key': 'demo' // Using demo key for limited functionality
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
        description: "Failed to convert text to speech. Using demo version with limited functionality.",
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

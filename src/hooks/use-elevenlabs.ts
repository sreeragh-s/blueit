
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useElevenLabs = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  
  // Default voice ID for ElevenLabs (Sarah voice)
  const voiceId = "EXAVITQu4vr4xnSDxMaL"; 
  
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // First try to get the API key from the environment variable
        const viteKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        
        if (viteKey) {
          setApiKey(viteKey);
          console.log("ElevenLabs API key loaded from environment");
          return;
        }
        
        // If not found in env, try to get from Supabase
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { secretName: 'ELEVENLABS_API_KEY' }
        });
        
        if (error) {
          throw new Error(`Error fetching API key: ${error.message}`);
        }
        
        if (data && data.value) {
          setApiKey(data.value);
          console.log("ElevenLabs API key loaded from Supabase");
        } else {
          throw new Error("API key is empty or not found");
        }
      } catch (error) {
        console.error('Failed to load ElevenLabs API key:', error);
        toast({
          title: "API Key Missing",
          description: "ElevenLabs API key is not configured. Please add your API key in project settings.",
          variant: "destructive"
        });
      }
    };
    
    fetchApiKey();
  }, [toast]);

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const speakText = async (text: string) => {
    try {
      if (!apiKey) {
        toast({
          title: "API key missing",
          description: "ElevenLabs API key is not configured. Please add your API key to continue.",
          variant: "destructive"
        });
        return false;
      }

      setIsLoading(true);
      stopSpeaking();
      
      // Create a new audio element
      const audio = new Audio();
      audioRef.current = audio;

      console.log("Using API key:", apiKey.substring(0, 5) + "...");

      // Call ElevenLabs API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
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
        const errorData = await response.json().catch(() => null);
        console.error("ElevenLabs API error:", response.status, errorData);
        throw new Error(`Failed to convert text to speech (Status: ${response.status})`);
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
    isLoading,
    hasApiKey: !!apiKey
  };
};

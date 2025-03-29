
import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Switch, 
} from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Channel name must be at least 3 characters.",
  }).max(50),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500),
  isPrivate: z.boolean().default(false),
  rules: z.string().optional(),
});

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommunityCreated?: () => Promise<void>;
}

const CreateCommunityDialog = ({
  open,
  onOpenChange,
  onCommunityCreated,
}: CreateCommunityDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string>("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
      rules: "",
    },
  });
  
  const handleBannerChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "The banner image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a channel",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent duplicate submissions by checking if we're already submitting
    if (isSubmitting) {
      return;
    }
    
    // Generate a unique submission ID for this form submission
    const currentSubmissionId = Date.now().toString();
    setSubmissionId(currentSubmissionId);
    setIsSubmitting(true);
    
    try {
      console.log("Creating channel with data:", {
        name: values.name,
        description: values.description,
        is_private: values.isPrivate,
        created_by: user.id
      });
      
      const rulesArray = values.rules
        ? values.rules.split('\n').filter(rule => rule.trim().length > 0)
        : [];
      
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: values.name,
          description: values.description,
          is_private: values.isPrivate,
          rules: rulesArray,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (communityError) {
        console.error("Error creating channel:", communityError);
        throw communityError;
      }
      
      console.log("Channel created successfully:", communityData);
      
      // Create member entry for creator
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: communityData.id,
          user_id: user.id,
          role: 'admin',
        });
      
      if (memberError) {
        console.error("Error adding member:", memberError);
        throw memberError;
      }
      
      let bannerUrl = null;
      if (bannerImage && communityData.id) {
        const fileExt = bannerImage.name.split('.').pop();
        const filePath = `${communityData.id}/banner.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('community_banners')
          .upload(filePath, bannerImage, {
            upsert: true,
          });
        
        if (uploadError) {
          console.error("Error uploading banner:", uploadError);
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('community_banners')
          .getPublicUrl(filePath);
        
        bannerUrl = data.publicUrl;
        
        const { error: updateError } = await supabase
          .from('communities')
          .update({ banner_image: bannerUrl })
          .eq('id', communityData.id);
        
        if (updateError) {
          console.error("Error updating banner URL:", updateError);
          throw updateError;
        }
      }
      
      toast({
        title: "Channel Created",
        description: `Successfully created "${values.name}" channel`,
      });
      
      onOpenChange(false);
      
      // Call the onCommunityCreated callback if provided
      if (onCommunityCreated) {
        await onCommunityCreated();
      }
      
      // Only navigate if this submission hasn't been superseded by another
      if (submissionId === currentSubmissionId) {
        navigate(`/community/${communityData.id}`);
      }
    } catch (error: any) {
      // Check if it's a duplicate channel error
      if (error.code === '23505' && error.message?.includes('communities_name_key')) {
        toast({
          title: "Channel Name Already Exists",
          description: "Please choose a different name for your channel",
          variant: "destructive",
        });
      } else {
        console.error("Complete error:", error);
        toast({
          title: "Failed to Create Channel",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset the form state when the dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setBannerImage(null);
      setBannerPreview(null);
      setIsSubmitting(false);
      setSubmissionId("");
    }
    onOpenChange(open);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>
            Create a new channel for people to join and discuss topics.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Channel Banner</FormLabel>
              <div 
                className={cn(
                  "w-full h-32 rounded-md border-2 border-dashed flex justify-center items-center cursor-pointer overflow-hidden",
                  bannerPreview ? "border-none p-0" : "p-4"
                )}
                onClick={() => document.getElementById('banner-upload')?.click()}
              >
                {bannerPreview ? (
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Upload className="h-6 w-6 mb-2" />
                    <p className="text-sm">Click to upload a banner image</p>
                    <p className="text-xs">(Max 5MB)</p>
                  </div>
                )}
              </div>
              <Input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Photography Enthusiasts" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be displayed as the title of your channel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What is this channel about?" 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the purpose and topic of your channel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Rules</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter each rule on a new line" 
                      className="resize-none min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Set guidelines for channel members to follow.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Private Channel</FormLabel>
                    <FormDescription>
                      If enabled, only invited members can join and view content.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Channel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCommunityDialog;

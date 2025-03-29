
import React, { useState, useEffect, ChangeEvent } from "react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Trash2 } from "lucide-react";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Channel name must be at least 3 characters.",
  }).max(50),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500),
  isPrivate: z.boolean(),
  rules: z.string().optional(),
});

interface EditCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: any;
  onCommunityUpdated: () => void;
}

const EditCommunityDialog = ({
  open,
  onOpenChange,
  community,
  onCommunityUpdated,
}: EditCommunityDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: community.name || "",
      description: community.description || "",
      isPrivate: community.is_private || false,
      rules: community.rules?.join('\n') || "",
    },
  });
  
  useEffect(() => {
    if (community) {
      form.reset({
        name: community.name || "",
        description: community.description || "",
        isPrivate: community.is_private || false,
        rules: community.rules?.join('\n') || "",
      });
      
      if (community.banner_image) {
        setBannerPreview(community.banner_image);
      }
    }
  }, [community, form]);
  
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
        description: "You must be logged in to edit this community",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Parse rules from text to JSON array
      const rulesArray = values.rules
        ? values.rules.split('\n').filter(rule => rule.trim().length > 0)
        : [];
      
      // Upload banner image if changed
      let bannerUrl = community.banner_image;
      if (bannerImage) {
        const fileExt = bannerImage.name.split('.').pop();
        const filePath = `${community.id}/banner.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community_banners')
          .upload(filePath, bannerImage, {
            upsert: true,
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data } = supabase.storage
          .from('community_banners')
          .getPublicUrl(filePath);
        
        bannerUrl = data.publicUrl;
      }
      
      // Update the community
      const { error: updateError } = await supabase
        .from('communities')
        .update({
          name: values.name,
          description: values.description,
          is_private: values.isPrivate,
          rules: rulesArray,
          banner_image: bannerUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', community.id);
      
      if (updateError) {
        throw updateError;
      }
      
      toast({
        title: "Community Updated",
        description: `Successfully updated "${values.name}" community`,
      });
      
      onCommunityUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Update Community",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteCommunity = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    try {
      // Delete community (cascade will handle related records)
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', community.id);
      
      if (error) throw error;
      
      toast({
        title: "Community Deleted",
        description: `${community.name} has been permanently deleted`,
      });
      
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete community",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>
              Update your Channel Settings and information.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Banner Image Upload */}
              <div className="space-y-2">
                <FormLabel>Community Banner</FormLabel>
                <div 
                  className={`w-full h-32 rounded-md border-2 border-dashed flex justify-center items-center cursor-pointer overflow-hidden relative ${
                    bannerPreview ? "border-none p-0" : "p-4"
                  }`}
                  onClick={() => document.getElementById('banner-upload')?.click()}
                >
                  {bannerPreview ? (
                    <>
                      <img 
                        src={bannerPreview} 
                        alt="Banner preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white text-sm">Click to change banner</p>
                      </div>
                    </>
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
                      This will be displayed as the title of your community.
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
                        placeholder="What is this community about?" 
                        className="resize-none min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the purpose and topic of your community.
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
                      Set guidelines for community members to follow.
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
              
              <DialogFooter className="flex justify-between gap-2 sm:justify-between">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Community
                </Button>
                
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this community? This action cannot be undone
              and all content will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCommunity}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Community"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditCommunityDialog;

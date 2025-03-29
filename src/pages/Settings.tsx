import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/sidebar"; // Updated import path
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).max(30),
  full_name: z.string().optional(),
  bio: z.string().max(500, {
    message: "Bio must not be longer than 500 characters.",
  }).optional(),
});

const accountFormSchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(1, {
    message: "Current password is required to update email.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, {
    message: "Current password is required.",
  }),
  newPassword: z.string().min(8, {
    message: "New password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(1, {
    message: "Please confirm your new password.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to access settings",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);
  
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
    },
  });
  
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, profileForm]);
  
  const accountForm = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user?.email || "",
      currentPassword: "",
    },
  });
  
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "The avatar image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    setIsUpdatingProfile(true);
    
    try {
      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            upsert: true,
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        avatarUrl = data.publicUrl;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          full_name: values.full_name,
          bio: values.bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      await refreshProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  const onAccountSubmit = async (values: z.infer<typeof accountFormSchema>) => {
    toast({
      title: "Not Implemented",
      description: "This feature is not yet implemented",
    });
  };
  
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    toast({
      title: "Not Implemented",
      description: "This feature is not yet implemented",
    });
  };
  
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container flex">
        <Sidebar />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold">Settings</h1>
            
            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                      Manage your profile information. This is how others will see you on the site.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-24 w-24">
                              {avatarPreview ? (
                                <AvatarImage 
                                  src={avatarPreview} 
                                  alt={profile?.username || "User"} 
                                />
                              ) : (
                                <AvatarFallback className="text-xl">
                                  {getInitials(profile?.username)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('avatar-upload')?.click()}
                            >
                              Change Avatar
                            </Button>
                            <Input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <FormField
                              control={profileForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="username" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    This is your public display name.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={profileForm.control}
                              name="full_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Optional. Your full name will be visible on your profile.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a little bit about yourself"
                                  className="resize-none min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Write a short bio about yourself. This will be displayed on your profile.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" disabled={isUpdatingProfile}>
                          {isUpdatingProfile ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                      Manage your account settings and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...accountForm}>
                      <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                        <FormField
                          control={accountForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                This is the email associated with your account.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={accountForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter your current password to confirm changes.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Update Email</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password here. After saving, you'll be logged out.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 8 characters long.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">Change Password</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;

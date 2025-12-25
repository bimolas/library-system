"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Navigation } from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/lib/theme-context";
import { useNotification } from "@/lib/notification-context";
import { mockCurrentUser } from "@/lib/mock-data";
import {
  Bell,
  Lock,
  SettingsIcon,
  LogOut,
  Camera,
  User,
  Mail,
  Save,
} from "lucide-react";
import ConfirmationModal, { useConfirmation } from "@/components/confirmation-modal";
import { getUser, updateProfile, logout } from "@/services/auth.service";
import router from "next/router";

export default function SettingsPage() {
  // const { theme, setTheme } = useTheme();
  let theme = "light";
  let setTheme = (t: "light" | "dark") => {};
  try {
    const ctx = useTheme();
    theme = ctx.theme;
    setTheme = ctx.setTheme;
  } catch (e) {
    console.warn("useTheme error:", e);
  }
  const { showSuccess, showError, showInfo } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState(
    getUser()?.imageUrl || "/profile-avatar.png"
  );
  const [name, setName] = useState(getUser()?.name || "");
  const [email, setEmail] = useState(getUser()?.email || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
const { confirm } = useConfirmation();
  const [notifications, setNotifications] = useState({
    bookAvailable: true,
    dueDateReminder: true,
    recommendations: true,
    communityActivity: false,
    scoreUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    showProfile: true,
    emailNotifications: true,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Selected file:", file);
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      showSuccess("Profile image selected. Save profile to upload.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userId = getUser()!.id;
      const updated = await updateProfile(
        userId,
        { name, email },
        profileFile || undefined
      );
      // if backend returns new image url, update preview
      if ((updated as any).profileImage) {
        setProfileImage((updated as any).profileImage);
      }
      showSuccess("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update profile error:", err);
      showError(err?.message || "Unable to update profile");
    }
  };

  const handleSaveNotifications = () => {
    showSuccess("Notification preferences saved!");
  };

  const handleSavePrivacy = () => {
    showSuccess("Privacy settings saved!");
  };

  const handleExportPDF = () => {
    showInfo("Preparing your PDF export...");
  };

  const handleExportCSV = () => {
    showInfo("Preparing your CSV export...");
  };

  const handleChangePassword = () => {
    showInfo("Password change feature coming soon!");
  };

  const handleLogoutAll = () => {
    logout();
    setShowLogoutAllConfirm(false);
  };

  const handleDeleteAccount = () => {
    showError("Account deletion initiated. Contact support to complete.");
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, preferences, and privacy
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-4 bg-muted/30">
            <TabsTrigger
              value="profile"
              className="gap-2 hover-lift transition-smooth"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="gap-2 hover-lift transition-smooth"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="gap-2 hover-lift transition-smooth"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="gap-2 hover-lift transition-smooth"
            >
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent
            value="profile"
            className="mt-6 space-y-4 animate-fadeIn"
          >
            <Card className="p-6 border-border hover-border transition-smooth">
              <h3 className="text-lg font-semibold mb-6">Profile Settings</h3>

              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="relative group">
                  <img
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 group-hover:border-primary/40 transition-all duration-300"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-3 rounded-full hover-lift hover-glow transition-smooth shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click camera icon to update photo
                </p>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="hover-border transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="hover-border transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Current Level
                  </Label>
                  <Badge className="bg-primary/10 text-primary border-primary/30 capitalize px-4 py-2 text-sm">
                    {mockCurrentUser.level} Member
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Member Since
                  </Label>
                  <p className="font-medium">
                    {mockCurrentUser.joinedDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSaveProfile}
                className="w-full mt-6 gap-2 hover-lift hover-glow transition-smooth"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </Button>
            </Card>

            {/* Theme Settings */}
            <Card className="p-6 border-border hover-border transition-smooth">
              <h3 className="text-lg font-semibold mb-4">Appearance</h3>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-semibold">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent
            value="notifications"
            className="mt-6 space-y-4 animate-fadeIn"
          >
            <Card className="p-6 border-border hover-border transition-smooth">
              <h3 className="text-lg font-semibold mb-6">
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover-border transition-smooth">
                  <div>
                    <p className="font-semibold">Book Available</p>
                    <p className="text-sm text-muted-foreground">
                      When a reserved book becomes available
                    </p>
                  </div>
                  <Switch
                    checked={notifications.bookAvailable}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        bookAvailable: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover-border transition-smooth">
                  <div>
                    <p className="font-semibold">Due Date Reminder</p>
                    <p className="text-sm text-muted-foreground">
                      3 days before your book is due
                    </p>
                  </div>
                  <Switch
                    checked={notifications.dueDateReminder}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        dueDateReminder: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover-border transition-smooth">
                  <div>
                    <p className="font-semibold">Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Personalized book suggestions
                    </p>
                  </div>
                  <Switch
                    checked={notifications.recommendations}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        recommendations: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover-border transition-smooth">
                  <div>
                    <p className="font-semibold">Community Activity</p>
                    <p className="text-sm text-muted-foreground">
                      When friends borrow or review books
                    </p>
                  </div>
                  <Switch
                    checked={notifications.communityActivity}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        communityActivity: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover-border transition-smooth">
                  <div>
                    <p className="font-semibold">Score Updates</p>
                    <p className="text-sm text-muted-foreground">
                      Changes to your reading score and level
                    </p>
                  </div>
                  <Switch
                    checked={notifications.scoreUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        scoreUpdates: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveNotifications}
                className="w-full mt-6 gap-2 hover-lift hover-glow transition-smooth"
              >
                <Save className="w-4 h-4" />
                Save Notification Settings
              </Button>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent
            value="privacy"
            className="mt-6 space-y-4 animate-fadeIn"
          >
            <Card className="p-6 border-border hover-border transition-smooth">
              <h3 className="text-lg font-semibold mb-6">
                Privacy & Visibility
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover-border transition-smooth">
                  <div>
                    <p className="font-semibold">Public Profile</p>
                    <p className="text-sm text-muted-foreground">
                      Show your reading history to other members
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showProfile}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        showProfile: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover-border transition-smooth">
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email in addition to in-app
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        emailNotifications: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePrivacy}
                className="w-full mt-6 gap-2 hover-lift hover-glow transition-smooth"
              >
                <Save className="w-4 h-4" />
                Save Privacy Settings
              </Button>
            </Card>

            {/* Export Data */}
            <Card className="p-6 border-border hover-border transition-smooth">
              <h3 className="text-lg font-semibold mb-2">Data & Export</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download your reading history and data
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="flex-1 bg-transparent hover-lift transition-smooth"
                >
                  Export as PDF
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="flex-1 bg-transparent hover-lift transition-smooth"
                >
                  Export as CSV
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent
            value="account"
            className="mt-6 space-y-4 animate-fadeIn"
          >
            {/* Password */}
            <Card className="p-6 border-border hover-border transition-smooth">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security
              </h3>
              <Button
                onClick={handleChangePassword}
                variant="outline"
                className="w-full bg-transparent hover-lift transition-smooth"
              >
                Change Password
              </Button>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-destructive/30 bg-destructive/5 hover:border-destructive/50 transition-smooth">
              <h3 className="text-lg font-semibold mb-4 text-destructive">
                Danger Zone
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be careful! These actions cannot be undone.
              </p>
             <Button
                 onClick={async () => {
                   const ok = await confirm({
                     title: "Logout from all devices?",
                     message:
                       "You will be logged out from all your active sessions. You'll need to log in again on each device.",
                     confirmText: "Logout All",
                     cancelText: "Cancel",
                     variant: "default",
                   });
                   if (ok) {
                     handleLogoutAll();
                   }
                 }}
                 variant="outline"
                 className="flex-1 bg-transparent hover-lift transition-smooth"
               >
                 <LogOut className="w-4 h-4 mr-2" />
                 Logout All Devices
               </Button>
               <Button
                 onClick={async () => {
                   const ok = await confirm({
                     title: "Delete your account?",
                     message:
                       "This action cannot be undone. All your data, reading history, and scores will be permanently deleted.",
                     confirmText: "Delete Account",
                     cancelText: "Cancel",
                     variant: "destructive",
                   });
                   if (ok) {
                     handleDeleteAccount();
                   }
                 }}
                 variant="destructive"
                 className="flex-1 hover-lift transition-smooth"
               >
                 Delete Account
               </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Modals */}
      {/* <ConfirmationModal

      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your account?"
        message="This action cannot be undone. All your data, reading history, and scores will be permanently deleted."
        confirmText="Delete Account"
        variant="danger"
      /> */}
    </div>
  );
}

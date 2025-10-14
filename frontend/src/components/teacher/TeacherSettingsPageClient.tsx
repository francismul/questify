"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Bell, Shield, Palette, BookOpen, Lock, ChevronDown, Eye, EyeOff } from "lucide-react";
import { UserSettings } from "@/types";

interface TeacherSettingsPageClientProps {
  initialUser: {
    first_name?: string;
    last_name?: string;
    email?: string;
    username?: string;
  };
}

export function TeacherSettingsPageClient({ initialUser }: TeacherSettingsPageClientProps) {
  const [settings, setSettings] = useState<UserSettings>({
    account: {
      firstName: initialUser?.first_name || "",
      lastName: initialUser?.last_name || "",
      email: initialUser?.email || "",
      username: initialUser?.username || "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      courseUpdates: true,
      studentMessages: true,
      systemAnnouncements: true,
      weeklyReports: true,
    },
    privacy: {
      profileVisibility: "private" as const,
      showEmail: false,
      showActivity: false,
      allowStudentMessages: true,
      dataSharing: false,
    },
    appearance: {
      theme: "system" as const,
      language: "en" as const,
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
    },
    teaching: {
      defaultCourseVisibility: "enrolled" as const,
      allowStudentCollaboration: true,
      autoGradeAssignments: false,
      notificationFrequency: "immediate" as const,
      preferredGradingScale: "percentage" as const,
      showProgressToStudents: true,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      loginAlerts: true,
      passwordLastChanged: new Date().toISOString(),
    },
  });

  const [activeTab, setActiveTab] = useState("account");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSettingChange = (category: keyof UserSettings, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // API call to save settings
      console.log("Saving settings:", settings);
      // Show success message
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Show error message
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords don't match");
      return;
    }

    try {
      // API call to change password
      console.log("Changing password");
      setPasswordData({ current: "", new: "", confirm: "" });
      // Show success message
    } catch (error) {
      console.error("Failed to change password:", error);
      // Show error message
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      // API call to delete account
      console.log("Deleting account");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "teaching", label: "Teaching", icon: BookOpen },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your teaching account preferences and configurations.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Account Settings */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input
                      value={settings.account.firstName}
                      onChange={(e) => handleSettingChange("account", "firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input
                      value={settings.account.lastName}
                      onChange={(e) => handleSettingChange("account", "lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={settings.account.email}
                      onChange={(e) => handleSettingChange("account", "email", e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <Input
                      value={settings.account.username}
                      onChange={(e) => handleSettingChange("account", "username", e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handlePasswordChange} variant="outline">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {key === "emailNotifications" && "Receive notifications via email"}
                        {key === "pushNotifications" && "Receive push notifications in browser"}
                        {key === "courseUpdates" && "Get notified about course changes and updates"}
                        {key === "studentMessages" && "Receive messages from students"}
                        {key === "systemAnnouncements" && "Important system announcements and updates"}
                        {key === "weeklyReports" && "Weekly summary reports of your teaching activity"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange("notifications", key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Privacy Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.privacy.profileVisibility === "public" ? "Public" :
                         settings.privacy.profileVisibility === "private" ? "Private" : "Enrolled Students Only"}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("privacy", "profileVisibility", "public")}>
                        Public
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("privacy", "profileVisibility", "enrolled")}>
                        Enrolled Students Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("privacy", "profileVisibility", "private")}>
                        Private
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {Object.entries(settings.privacy).filter(([key]) => key !== "profileVisibility").map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {key === "showEmail" && "Display your email address on your profile"}
                        {key === "showActivity" && "Show your recent activity to others"}
                        {key === "allowStudentMessages" && "Allow students to send you direct messages"}
                        {key === "dataSharing" && "Share anonymized usage data to improve the platform"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange("privacy", key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Appearance</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.appearance.theme === "light" ? "Light" :
                         settings.appearance.theme === "dark" ? "Dark" : "System"}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "theme", "light")}>
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "theme", "dark")}>
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "theme", "system")}>
                        System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.appearance.language === "en" ? "English" : "Spanish"}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "language", "en")}>
                        English
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "language", "es")}>
                        Spanish
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.appearance.timezone}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "timezone", "UTC")}>
                        UTC
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "timezone", "EST")}>
                        EST
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "timezone", "PST")}>
                        PST
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date Format</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.appearance.dateFormat}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "dateFormat", "MM/DD/YYYY")}>
                        MM/DD/YYYY
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "dateFormat", "DD/MM/YYYY")}>
                        DD/MM/YYYY
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("appearance", "dateFormat", "YYYY-MM-DD")}>
                        YYYY-MM-DD
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}

          {/* Teaching Settings */}
          {activeTab === "teaching" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Teaching Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Course Visibility</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.teaching.defaultCourseVisibility === "public" ? "Public" :
                         settings.teaching.defaultCourseVisibility === "enrolled" ? "Enrolled Students Only" : "Private"}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "defaultCourseVisibility", "public")}>
                        Public
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "defaultCourseVisibility", "enrolled")}>
                        Enrolled Students Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "defaultCourseVisibility", "private")}>
                        Private
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notification Frequency</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.teaching.notificationFrequency === "immediate" ? "Immediate" :
                         settings.teaching.notificationFrequency === "daily" ? "Daily Digest" : "Weekly Summary"}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "notificationFrequency", "immediate")}>
                        Immediate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "notificationFrequency", "daily")}>
                        Daily Digest
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "notificationFrequency", "weekly")}>
                        Weekly Summary
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Grading Scale</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.teaching.preferredGradingScale === "percentage" ? "Percentage" :
                         settings.teaching.preferredGradingScale === "letter" ? "Letter Grade" : "Points"}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "preferredGradingScale", "percentage")}>
                        Percentage
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "preferredGradingScale", "letter")}>
                        Letter Grade
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("teaching", "preferredGradingScale", "points")}>
                        Points
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {Object.entries(settings.teaching).filter(([key]) => !["defaultCourseVisibility", "notificationFrequency", "preferredGradingScale"].includes(key)).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {key === "allowStudentCollaboration" && "Allow students to collaborate on assignments"}
                        {key === "autoGradeAssignments" && "Automatically grade multiple choice and simple assignments"}
                        {key === "showProgressToStudents" && "Display assignment progress and grades to students"}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={typeof value === "boolean" ? value : false}
                        onChange={(e) => handleSettingChange("teaching", key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Two-Factor Authentication</label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorEnabled}
                      onChange={(e) => handleSettingChange("security", "twoFactorEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Login Alerts</label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => handleSettingChange("security", "loginAlerts", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {settings.security.sessionTimeout} minutes
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleSettingChange("security", "sessionTimeout", 15)}>
                        15 minutes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("security", "sessionTimeout", 30)}>
                        30 minutes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("security", "sessionTimeout", 60)}>
                        60 minutes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSettingChange("security", "sessionTimeout", 120)}>
                        120 minutes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-6 border-t">
            <Button onClick={handleSaveSettings} className="w-full">
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
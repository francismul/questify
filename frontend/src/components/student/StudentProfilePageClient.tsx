"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Camera, Save, X, Award, TrendingUp, Calendar } from "lucide-react";
import { User as UserType } from "@/lib/auth-server";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageModal } from "@/components/ui/ImageModal";

interface Props {
  initialUser: UserType;
}

export function StudentProfilePageClient({ initialUser }: Props) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      
      if (selectedImage) {
        formDataToSend.append('avatar', selectedImage);
      }

      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        setSelectedImage(null);
        setImagePreview(null);
        // Refresh the page to update navigation
        router.refresh();
      } else if (response.status === 401) {
        // Token refresh failed, redirect to login
        router.push('/auth/login');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (!isEditing && (imagePreview || user.avatar)) {
      setShowImageModal(true);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="text-center">
              {/* Profile Picture */}
              <div className="relative mb-4">
                <div
                  className={`w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-accent/20 ${
                    !isEditing && (imagePreview || user.avatar) ? 'cursor-pointer hover:border-accent/40 transition-colors' : ''
                  }`}
                  onClick={handleAvatarClick}
                >
                  {imagePreview || user.avatar ? (
                    <Image
                      src={imagePreview || user.avatar || ""}
                      alt="Profile"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent to-metric-purple flex items-center justify-center">
                      <span className="text-3xl font-bold text-accent-foreground">
                        {getInitials(user.first_name || "", user.last_name || "")}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-1/2 transform translate-x-16 w-10 h-10 bg-muted rounded-full flex items-center justify-center shadow-lg hover:bg-muted/80 transition-colors"
                    title="Change avatar"
                  >
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Basic Info Display */}
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.email.split('@')[0]
                }
              </h2>
              <p className="text-muted-foreground capitalize mb-4">{user.role}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-accent">{user.level}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{user.total_xp}</div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{user.streak_days}</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <p className="text-foreground py-2 px-3 bg-muted/50 rounded-md">
                    {user.first_name || 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter your last name"
                  />
                ) : (
                  <p className="text-foreground py-2 px-3 bg-muted/50 rounded-md">
                    {user.last_name || 'Not provided'}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Email Address
                  <span className="text-xs text-muted-foreground ml-2">(readonly)</span>
                </label>
                <p className="text-foreground py-2 px-3 bg-muted/50 rounded-md border border-muted">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed as it serves as your unique identifier.
                </p>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Account Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-lg">
                <TrendingUp className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-accent">{user.total_xp}</div>
                  <div className="text-sm text-muted-foreground">Total XP Earned</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-lg">
                <Award className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-accent">Level {user.level}</div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-lg">
                <Calendar className="w-8 h-8 text-accent" />
                <div>
                  <div className="text-2xl font-bold text-accent">{user.streak_days}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Account Type</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {new Date(user.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={imagePreview || user.avatar || ""}
        alt="Profile Picture"
        title={`${user.first_name} ${user.last_name}`}
      />
    </div>
  );
}
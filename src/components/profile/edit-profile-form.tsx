"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { UserData } from '@/types';

interface EditProfileFormProps {
    userData: UserData;
}

const generateUsername = (name: string) => {
    return `@${name.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function EditProfileForm({ userData }: EditProfileFormProps) {
    const { toast } = useToast();
    const [firstName, lastName] = userData.Name.split(' ');

    const [bio, setBio] = useState(userData.Position || "Field Worker");
    const [location, setLocation] = useState("San Francisco, CA");

    const username = generateUsername(userData.Name);
    const initials = userData.Name.split(' ').map(n => n[0]).join('');

    const handleSaveChanges = () => {
        console.log("Saving changes:", { bio, location });
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
    };
    
    return (
        <>
        <Toaster />
        <div className="space-y-8 max-w-2xl mx-auto">
            {/* Change Photo Section */}
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${username}`} alt={userData.Name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <Button variant="link" className="text-primary p-0 h-auto text-base font-semibold">
                    Change profile photo
                </Button>
            </div>

            {/* Name Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName || ''} disabled />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName || ''} disabled />
                </div>
            </div>
             <p className="text-sm text-muted-foreground -mt-6">
                You can only change your name once, and you must use your real name. <Button variant="link" className="text-primary p-0 h-auto" disabled>Change name.</Button>
            </p>

            {/* Bio Section */}
            <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={150}
                    placeholder="Tell us about yourself"
                    className="min-h-[100px]"
                />
                <p className="text-sm text-right text-muted-foreground">
                    {bio.length} / 150
                </p>
            </div>

            {/* Location Section */}
            <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input 
                    id="location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Your city or region"
                />
            </div>

            <div className="flex justify-start pt-4">
                <Button onClick={handleSaveChanges}>Save changes</Button>
            </div>
        </div>
        </>
    );
}
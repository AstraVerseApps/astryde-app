
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/context/UserContext";
import { CheckCircle, Edit } from "lucide-react";

export default function ProfilePage() {
    const { user, isAdmin } = useUser();
    const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
    const userAvatar = user?.photoURL;
    const userDisplayName = user?.displayName || user?.email;


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">User Profile</h1>
        <Button size="sm" variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-4 rounded-full border-primary/20">
                <AvatarImage src={userAvatar || `https://placehold.co/100x100/BFDBFE/1E3A8A/png?text=${userInitial}`} />
                <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl break-all">{userDisplayName}</CardTitle>
            {isAdmin && (
                <CardDescription className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-4 h-4" /> Verified Creator
                </CardDescription>
            )}
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Astryde user since {new Date(user?.metadata.creationTime || Date.now()).toLocaleDateString()}.
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Manage your Astryde account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="username">Display Name</Label>
                    <Input id="username" placeholder="Your cosmic handle" defaultValue={user?.displayName || ''} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Add your phone number" defaultValue={user?.phoneNumber || ''} />
                </div>
                {isAdmin && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label>Creator Mode</Label>
                            <p className="text-sm text-muted-foreground">
                                Access creator tools and admin panel.
                            </p>
                        </div>
                        <Switch defaultChecked disabled/>
                    </div>
                )}
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
      </div>
    </>
  );
}

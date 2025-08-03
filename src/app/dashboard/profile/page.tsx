import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Edit } from "lucide-react";

export default function ProfilePage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">User Profile</h1>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="items-center">
            <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="https://placehold.co/100x100/864DC7/FFFFFF/png?text=U" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">Stellar Voyager</CardTitle>
            <CardDescription className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" /> Verified Creator
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Exploring the vast universe of technology, one commit at a time.
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Manage your Astryde account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="Stellar Voyager" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="voyager@astryde.dev" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Verified Status</Label>
                        <p className="text-sm text-muted-foreground">
                            Display a verified checkmark next to your name.
                        </p>
                    </div>
                    <Switch defaultChecked/>
                </div>
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
      </div>
    </>
  );
}

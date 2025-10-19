import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Progress } from "../components/ui/progress";
import { User, CreditCard, Bell, Settings as SettingsIcon, Users, Crown, Plus, Trash2, Edit, Key, ExternalLink } from "lucide-react";
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface SettingsProps {
  onUpgrade?: () => void;
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()

  const [profileData, setProfileData] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john.doe@company.com",
    company: "Acme Corp"
  });

  const [notifications, setNotifications] = useState({
    emailReports: true,
    usageAlerts: true,
    productUpdates: false,
    billingReminders: true
  });

  // Mock data
  const currentPlan = userProfile?.plan_type || "free"; // or "pro"
  const usageData = {
    used: userProfile?.journey_count || 3,
    total: currentPlan === "free" ? 5 : 25,
    resetDate: currentPlan === "pro" ? "Jan 15, 2025" : null
  };

  const teamMembers = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Admin",
      status: "Active",
      joinDate: "Dec 1, 2024"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Editor",
      status: "Active",
      joinDate: "Dec 5, 2024"
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "Viewer",
      status: "Pending",
      joinDate: "Dec 8, 2024"
    }
  ];

  const billingHistory = [
    {
      id: "1",
      date: "Dec 1, 2024",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "Paid"
    },
    {
      id: "2",
      date: "Nov 1, 2024",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "Paid"
    },
    {
      id: "3",
      date: "Oct 1, 2024",
      description: "Journey Top-up (5 extra)",
      amount: "$15.00",
      status: "Paid"
    }
  ];

  const planFeatures = {
    free: [
      "5 customer journeys total",
      "Basic templates",
      "PDF export",
      "Email support"
    ],
    pro: [
      "25 customer journeys per month",
      "All premium templates",
      "Advanced AI insights",
      "PDF, CSV, DOCX export",
      "Priority support",
      "Team collaboration (up to 5 users)",
      "Custom integrations"
    ],
    enterprise: [
      "Unlimited journeys",
      "Custom templates",
      "Advanced analytics",
      "White-label reports",
      "Dedicated support",
      "Unlimited team members",
      "SSO & advanced security",
      "API access"
    ]
  };

  const handleUpgrade = () => {
    navigate('/upgrade')
  }

  return (
    <div className="settings-page p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account, billing, and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                />
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-medium text-xl">JD</span>
                </div>
                <div className="space-y-2">
                  <Button variant="outline">Upload New Picture</Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG up to 2MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input type="password" value="••••••••" disabled className="flex-1" />
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Add an extra layer of security</span>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {currentPlan === "free" ? "Free Plan" : "Pro Plan"}
                    </h3>
                    <Badge variant={currentPlan === "pro" ? "default" : "secondary"}
                           className={currentPlan === "pro" ? "bg-green-600" : ""}>
                      {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {currentPlan === "free"
                      ? "Perfect for getting started"
                      : `$29/month • Next billing: ${usageData.resetDate}`
                    }
                  </p>
                </div>
                {currentPlan === "free" && (
                  <Button onClick={handleUpgrade} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Crown className="h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>

              {/* Usage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Journey Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {usageData.used} of {usageData.total} used
                  </span>
                </div>
                <Progress
                  value={(usageData.used / usageData.total) * 100}
                  className="h-2 [&>*]:bg-green-600"
                />
                {currentPlan === "pro" && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Resets {usageData.resetDate}
                    </span>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-3 w-3" />
                      Buy More Journeys
                    </Button>
                  </div>
                )}
              </div>

              {/* Plan Features */}
              <div>
                <h4 className="font-medium mb-3">Plan Features</h4>
                <ul className="space-y-2">
                  {planFeatures[currentPlan as keyof typeof planFeatures].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Plan Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Plan */}
                <div className={`border rounded-lg p-4 ${currentPlan === "free" ? "border-green-600 bg-green-50" : ""}`}>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">Free</h3>
                      <p className="text-2xl font-bold">$0<span className="text-sm font-normal">/month</span></p>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {planFeatures.free.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {currentPlan !== "free" && (
                      <Button variant="outline" size="sm" className="w-full">
                        Downgrade
                      </Button>
                    )}
                  </div>
                </div>

                {/* Pro Plan */}
                <div className={`border rounded-lg p-4 ${currentPlan === "pro" ? "border-green-600 bg-green-50" : ""}`}>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">Pro</h3>
                      <p className="text-2xl font-bold">$29<span className="text-sm font-normal">/month</span></p>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {planFeatures.pro.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {currentPlan === "free" && (
                      <Button onClick={handleUpgrade} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="border rounded-lg p-4 opacity-60">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">Enterprise</h3>
                      <p className="text-2xl font-bold">Custom</p>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {planFeatures.enterprise.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                      <li className="text-muted-foreground">+ More features</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          {currentPlan === "pro" && (
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-reports">Journey Reports Ready</Label>
                    <p className="text-sm text-muted-foreground">Get notified when your AI-generated reports are ready</p>
                  </div>
                  <Switch
                    id="email-reports"
                    checked={notifications.emailReports}
                    onCheckedChange={(checked) => setNotifications({...notifications, emailReports: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="usage-alerts">Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alerts when approaching your plan limits</p>
                  </div>
                  <Switch
                    id="usage-alerts"
                    checked={notifications.usageAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, usageAlerts: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="product-updates">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">News about new features and improvements</p>
                  </div>
                  <Switch
                    id="product-updates"
                    checked={notifications.productUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, productUpdates: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="billing-reminders">Billing Reminders</Label>
                    <p className="text-sm text-muted-foreground">Reminders about upcoming payments and renewals</p>
                  </div>
                  <Switch
                    id="billing-reminders"
                    checked={notifications.billingReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, billingReminders: checked})}
                  />
                </div>
              </div>

              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">OpenAI API</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use your own OpenAI API key for enhanced AI features
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Key className="h-3 w-3" />
                    Update API Key
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Slack</h3>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get notifications and updates in your Slack workspace
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Connect Slack
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Google Analytics</h3>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Import user behavior data for more accurate journey mapping
                  </p>
                  <Button variant="outline" size="sm" className="gap-2" disabled>
                    <ExternalLink className="h-3 w-3" />
                    Coming Soon
                  </Button>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">HubSpot CRM</h3>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sync customer data and touchpoints from your CRM
                  </p>
                  <Button variant="outline" size="sm" className="gap-2" disabled>
                    <ExternalLink className="h-3 w-3" />
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-6">
          {currentPlan === "free" ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Team Collaboration</h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to Pro to invite team members and collaborate on customer journey maps
                </p>
                <Button onClick={handleUpgrade} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Team Members</CardTitle>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                      <Plus className="h-4 w-4" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={member.status === "Active" ? "default" : "secondary"}>
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Admin</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Full access to all features</li>
                        <li>• Manage team members</li>
                        <li>• Billing and settings</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Editor</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Create and edit journeys</li>
                        <li>• Access all templates</li>
                        <li>• Export reports</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Viewer</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• View journeys and reports</li>
                        <li>• Comment on journeys</li>
                        <li>• Export basic reports</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
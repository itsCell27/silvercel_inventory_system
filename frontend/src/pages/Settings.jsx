import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { Sun, Moon, LogOut, Palette, CircleUserRound, KeyRound, User, Loader2, UserRoundPen, LockKeyholeOpen, Mail, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useTheme } from '@/context/ThemeContext'
import { UserAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { logout, session } = UserAuth();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const currentEmail = session?.user?.email || 'Not set';
  
  // Email change states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Error:', error);
    }
  };

  const handleSendVerificationCode = async () => {
    setLoading(true);
    
    try {
      // Use Supabase's built-in reauthentication
      const { data, error } = await supabase.auth.reauthenticate();

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification code sent to your email!');
        setCodeSent(true);
      }
    } catch (error) {
      toast.error('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (newEmail !== confirmNewEmail) {
      toast.error("Emails don't match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);
    
    try {
      // Update email with the nonce (verification code)
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail,
        nonce: verificationCode // Pass the OTP code as nonce
      });
      
      if (error) {
        if (error.message.includes('nonce') || error.message.includes('invalid')) {
          toast.error('Invalid or expired verification code');
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      //toast.success('Confirmation email sent to your new address!');
      // Instead of toast.success, show dialog
      setConfirmationDialogOpen(true);
      
      // Reset dialog state
      setEmailDialogOpen(false);
      setVerificationCode('');
      setNewEmail('');
      setConfirmNewEmail('');
      setCodeSent(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mt-2 sm:mt-0'>
      <p className="text-2xl font-semibold mb-6">Settings</p>
      <div className="space-y-6 max-w-[100vw]">
        <Card className="p-6">
            <div className='flex gap-2 items-center'>
                <Palette className="" />
                <p className="text-lg font-semibold">Appearance</p>
            </div>
          
            {/* item */}
            <div className="flex items-center justify-between">
                <div className='mr-2'>
                <h3 className="font-medium">Theme</h3>
                <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                </p>
                </div>
                <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10"
                >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </Card>

        <Card className="p-6">
            <div className='flex gap-2 items-center'>
                <CircleUserRound className='' />
                <p className="text-lg font-semibold">Account</p>
            </div>

            {/* Email Change */}
            <div className='pb-6 border-b'>
              <div className="flex items-center justify-between">
                <div className='mr-2'>
                  <div className='flex gap-2 items-center'>
                    <Mail className="h-4 w-4" />
                    <h3 className="font-medium">Change Email</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current Email: {session?.user?.email || 'Not set'}
                  </p>
                </div>
                <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => {
                        // Reset all states when opening dialog
                        setVerificationCode('');
                        setNewEmail('');
                        setConfirmNewEmail('');
                        setCodeSent(false);
                      }}
                      className="sm:min-w-40"
                    >
                      <Mail className="h-4 w-4 sm:hidden" />
                      <span className='sm:block hidden'>Change Email</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Change Email Address</DialogTitle>
                      <DialogDescription>
                        Verify your current email, then enter your new email address.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      {/* Step 1: Send Verification Code */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" />
                          Step 1: Verify Current Email
                        </Label>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSendVerificationCode}
                            disabled={codeSent || loading}
                            className="w-full"
                            variant={codeSent ? "secondary" : "default"}
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {codeSent ? 'Code Sent ✓' : 'Send Verification Code'}
                          </Button>
                        </div>
                      </div>

                      {/* Step 2 & 3 Combined: Enter Code and New Email */}
                      {codeSent && (
                        <div className="space-y-4 pt-4 border-t">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4" />
                              Step 2: Enter Verification Code & New Email
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Check your email for the 6-digit code
                            </p>
                            <InputOTP
                              maxLength={6}
                              value={verificationCode}
                              onChange={setVerificationCode}
                              className="w-full flex justify-center"
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>

                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              New Email Address
                            </Label>
                            <Input
                              type="email"
                              placeholder="New email address"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                            />
                            <Input
                              type="email"
                              placeholder="Confirm new email address"
                              value={confirmNewEmail}
                              onChange={(e) => setConfirmNewEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      {codeSent && (
                        <Button 
                          onClick={handleChangeEmail}
                          disabled={!newEmail || !confirmNewEmail || verificationCode.length !== 6 || loading}
                          className="w-full"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Change Email
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Username Change */}
            <div className='pb-6 border-b'>
              <div className="flex items-center justify-between">
                <div className='mr-2'>
                  <div className='flex gap-2 items-center'>
                    <User className="h-4 w-4" />
                    <h3 className="font-medium">Change Username</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current Username: {session?.user?.user_metadata?.username || 'Not set'}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="sm:min-w-40">
                      <UserRoundPen className="h-4 w-4 sm:hidden" />
                      <span className='sm:block hidden'>Change Username</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Username</DialogTitle>
                      <DialogDescription>
                        Enter your new username below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="New username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        disabled={!newUsername || loading}
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const { data, error } = await supabase.auth.updateUser({
                              data: { username: newUsername }
                            });

                            if (error) throw error;
                            
                            toast.success('Username updated successfully');
                            setNewUsername('');
                          } catch (error) {
                            toast.error(error.message);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Password Change */}
            <div className=" pb-6 border-b">
              <div className="flex items-center justify-between">
                <div className='mr-2'>
                  <div className='flex gap-2 items-center'>
                    <KeyRound className="h-4 w-4" />
                    <h3 className="font-medium">Change Password</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Update your account password
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="sm:min-w-40">
                      <LockKeyholeOpen className="h-4 w-4 sm:hidden" />
                      <span className='sm:block hidden'>Change Password</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and a new password below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        disabled={!currentPassword || !newPassword || !confirmNewPassword || loading}
                        onClick={async () => {
                          if (newPassword !== confirmNewPassword) {
                            toast.error("New passwords don't match");
                            return;
                          }

                          setLoading(true);
                          try {
                            // First verify the current password
                            const { error: signInError } = await supabase.auth.signInWithPassword({
                              email: session.user.email,
                              password: currentPassword,
                            });

                            if (signInError) {
                              toast.error('Current password is incorrect');
                              return;
                            }

                            // Update to new password
                            const { error } = await supabase.auth.updateUser({ 
                              password: newPassword 
                            });

                            if (error) throw error;
                            
                            toast.success('Password updated successfully');
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmNewPassword('');
                          } catch (error) {
                            toast.error(error.message);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* item */}
            <div className="flex items-center justify-between">
                <div className='mr-2'>
                    <h3 className="font-medium">Logout</h3>
                    <p className="text-sm text-muted-foreground">
                    Sign out of your account
                    </p>
                </div>
                <Button
                    onClick={handleLogout}
                    className="gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>

        </Card>
      </div>

      {/* handleChangeEmail Success Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-[450px] text-center">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-green-600">
              Confirm Your Email Change
            </DialogTitle>
            <DialogDescription>
              We’ve sent confirmation emails to both your <strong>{currentEmail}</strong> and <strong>{newEmail}</strong> email addresses.
              <br />
              Please open both inboxes and click the confirmation links to finalize your email update.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmationDialogOpen(false)} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
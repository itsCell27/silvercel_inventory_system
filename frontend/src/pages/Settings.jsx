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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sun, Moon, LogOut, Palette, CircleUserRound, KeyRound, User, Loader2, UserRoundPen, LockKeyholeOpen, Mail, ShieldCheck, Eye, EyeOff, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useTheme } from '@/context/ThemeContext'
import { UserAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import BackToTopButton from "@/components/BackToTopButton";

function PasswordRequirement({ met, text }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
      {met ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
}

export default function Settings() {
  const { theme, toggleTheme, colorTheme, setColorTheme } = useTheme();
  const { logout, session } = UserAuth();
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState('');

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password validation checks
  const passwordChecks = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };

  const allChecksPassed = Object.values(passwordChecks).every(check => check);


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

            {/* item */}
            <div className="flex items-center justify-between">
                <div className='mr-4'>
                <h3 className="font-medium">Color Theme</h3>
                <p className="text-sm text-muted-foreground">
                    Switch between colors
                </p>
                </div>
                <RadioGroup
                  value={colorTheme}
                  onValueChange={(value) => setColorTheme(value)}
                  defaultValue="default"
                  className="flex justify-end items-center gap-3 flex-wrap"
                >
                  {/* Default Theme */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="default"
                      id="theme-default"
                      className="w-6 h-6 rounded-full border-[3px] border-[oklch(0.68_0.16_250)] 
                        data-[state=checked]:bg-[oklch(0.68_0.16_250)] 
                        data-[state=checked]:border-[oklch(0.68_0.16_250)] 
                        transition-all hover:scale-110"
                    />
                  </div>

                  {/* Purple Theme */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="purple"
                      id="theme-purple"
                      className="w-6 h-6 rounded-full border-[3px] border-[oklch(0.55_0.22_280)] 
                        data-[state=checked]:bg-[oklch(0.55_0.22_280)] 
                        data-[state=checked]:border-[oklch(0.55_0.22_280)] 
                        transition-all hover:scale-110"
                    />
                  </div>

                  {/* Green Theme */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="green"
                      id="theme-green"
                      className="w-6 h-6 rounded-full border-[3px] border-[oklch(0.6_0.21_140)] 
                        data-[state=checked]:bg-[oklch(0.6_0.21_140)] 
                        data-[state=checked]:border-[oklch(0.6_0.21_140)] 
                        transition-all hover:scale-110"
                    />
                  </div>

                  {/* Pink Theme */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="pink"
                      id="theme-pink"
                      className="w-6 h-6 rounded-full border-[3px] border-[oklch(0.63_0.12_350)] 
                        data-[state=checked]:bg-[oklch(0.63_0.12_350)] 
                        data-[state=checked]:border-[oklch(0.63_0.12_350)] 
                        transition-all hover:scale-110"
                    />
                  </div>

                  {/* Red Theme */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="red"
                      id="theme-red"
                      className="w-6 h-6 rounded-full border-[3px] border-[oklch(0.65_0.25_25)] 
                        data-[state=checked]:bg-[oklch(0.65_0.25_25)] 
                        data-[state=checked]:border-[oklch(0.65_0.25_25)] 
                        transition-all hover:scale-110"
                    />
                  </div>
                </RadioGroup>

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
                            className="w-full text-white"
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
                          className="w-full text-white"
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
                        className="text-white"
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
                      {/* Current Password */}
                      <div className="relative">
                        <Input
                          type={showCurrent ? "text" : "password"}
                          placeholder="Current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="flex flex-col items-start w-full">
                        {/* New Password */}
                        <div className="relative w-full">
                          <Input
                            type={showNew ? "text" : "password"}
                            placeholder="New password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          >
                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Password Requirements */}
                        <div className="mt-2 space-y-1 text-xs">
                          <p className="font-medium text-muted-foreground">Password must contain:</p>

                          <PasswordRequirement
                            met={passwordChecks.minLength}
                            text="At least 8 characters"
                          />
                          <PasswordRequirement
                            met={passwordChecks.hasUpperCase}
                            text="One uppercase letter (A-Z)"
                          />
                          <PasswordRequirement
                            met={passwordChecks.hasLowerCase}
                            text="One lowercase letter (a-z)"
                          />
                          <PasswordRequirement
                            met={passwordChecks.hasNumber}
                            text="One number (0-9)"
                          />
                          <PasswordRequirement
                            met={passwordChecks.hasSpecialChar}
                            text="One special character (!@#$%^&*...)"
                          />
                        </div>
                      </div>


                      {/* Confirm New Password */}
                      <div className="relative">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        className="text-white"
                        disabled={!currentPassword || !newPassword || !confirmNewPassword || !allChecksPassed || loading}
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
                    className="sm:gap-2 text-white"
                >
                    <LogOut className="h-4 w-4" />
                    <span className='hidden sm:block'>Logout</span>
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
              We’ve sent confirmation emails to both your <strong>{currentEmail}</strong> and <strong>{newEmail || "new"}</strong> email addresses.
              <br />
              Please open both inboxes and click the confirmation links to finalize your email update.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmationDialogOpen(false)} className="w-full text-white">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BackToTopButton />

    </div>
  )
}
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CircleCheckBig, Eye, EyeOff, Smile, Package } from "lucide-react";

export default function Welcome() {
  const [userEmail, setUserEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // 🧠 Fetch the logged-in user's email (auto from invite link session)
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error);
      if (data?.user?.email) setUserEmail(data.user.email);
    };
    fetchUser();
  }, []);

  // 🔒 Password validation
  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    return regex.test(pwd);
  };

  // 🧩 Handle password setup
  const handleSetPassword = async (e) => {
    e.preventDefault();

    if (!validatePassword(password)) {
      const msg =
        "Password must be at least 8 characters and include upper & lowercase letters, a digit, and a symbol.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success("Welcome! Your password has been set successfully.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-muted">
      {!done ? (
        <form
          onSubmit={handleSetPassword}
          className="bg-card text-card-foreground p-6 sm:p-8 rounded-xl shadow w-96 max-w-[90vw] space-y-6"
        >
          {/* App Brand */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Package className="text-primary" size={24} />
              <h1 className="text-xl font-bold tracking-tight">
                SilverCel Inventory System
              </h1>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-semibold">
              <Smile className="text-primary" /> Welcome!
            </h2>
            {userEmail ? (
              <p className="text-sm text-muted-foreground">
                Hi <span className="font-medium text-foreground">{userEmail}</span>, your account has been activated.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your account has been activated.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Please set your password to continue.
            </p>
          </div>

          {/* Password Fields */}
          <div className="flex flex-col w-full items-start gap-1 relative">
            <p className="text-sm">New Password</p>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col w-full items-start gap-1 relative">
            <p className="text-sm">Confirm Password</p>
            <div className="relative w-full">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full text-white">
            Set Password & Continue
          </Button>
        </form>
      ) : (
        <div className="text-center space-y-3">
          <h2 className="flex items-center gap-4 text-2xl font-semibold mb-10">
            Password Set <CircleCheckBig size={28} />
          </h2>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      )}
    </div>
  );
}

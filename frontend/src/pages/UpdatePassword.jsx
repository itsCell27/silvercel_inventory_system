import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CircleCheckBig } from "lucide-react";
import { Eye, EyeOff, Package } from "lucide-react";


export default function UpdatePassword() {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    // Minimum 8 chars, at least one uppercase, one lowercase, one digit, one symbol
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    return regex.test(pwd);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      const msg = "Password must be at least 8 characters and include upper & lowercase letters, a digit, and a symbol.";
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
        setError(error.message)
        toast.error(error.message)
    } else {
        setDone(true)
        toast.success("Password Updated")
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-muted">
      {!done ? (
        <form onSubmit={handleUpdate} className="bg-card text-card-foreground p-6 sm:p-8 rounded-xl shadow w-80 max-w-[90vw] space-y-6">
            <h1 className="text-2xl font-semibold text-center mb-8">Reset Password</h1>
            <div className="flex flex-col w-full items-start gap-1 relative">
                <p className="text-sm text-center">New Password</p>
                <div className="relative w-full">
                    <Input type={showPassword ? "text" : "password"} placeholder="New Password" onChange={(e) => setPassword(e.target.value)} />
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
                <p className="text-sm text-center">Confirm Password</p>
                <div className="relative w-full">
                    <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                
            </div>
            <Button type="submit" className="w-full text-white">Update Password</Button>
        </form>
      ) : (
        <div className="text-center space-y-3">
          <h2 className="flex items-center gap-4 text-2xl font-semibold mb-10">Password Updated <CircleCheckBig size={28} /></h2>
          <Button onClick={() => navigate("/login")}>Return to Login</Button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Eye, EyeOff, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  const { session, login } = UserAuth();
  //console.log(session);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/app");
      } else {
        toast.error("Incorrect email or password.");
      }
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col md:flex-row justify-center min-h-screen w-full bg-muted text-foreground overflow-y-auto p-4">

      {/* Mobile */}
      <div className="flex flex-col md:hidden justify-center items-center w-full md:w-1/2 p-8 text-center">
        {/* <img
            src="/logo.png"
            alt="SilverCel Logo"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
        /> */}
        <div className="p-4 mb-4 bg-primary rounded-full text-background dark:text-foreground">
          <Package size={30}/>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">
          SilverCell
        </h1>
        <p>Inventory System</p>
      </div>

      <Card className="flex flex-col md:flex-row w-full max-w-[90vw] sm:max-w-[80vw] lg:max-w-[60vw] xl:max-w-[70vw] 2xl:max-w-[50vw] rounded-2xl overflow-hidden shadow-xl border border-border p-0 gap-0">
        {/* Left square */}
        <div className="md:flex flex-col hidden justify-center items-center w-full md:w-1/2 p-8 text-center bg-card">
          {/* <img
              src="/logo.png"
              alt="SilverCel Logo"
              className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
          /> */}
          <div className="p-6 mb-4 bg-primary rounded-full text-background dark:text-foreground">
            <Package size={60}/>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            SilverCell
          </h1>
          <p>Inventory System</p>
        </div>

        {/* Right square (Login form) */}
        <CardContent className="w-full md:w-1/2 flex flex-col justify-center bg-background p-6 sm:p-10">
          
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">
            Login
          </h2>

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email */}
            <div className="flex flex-col items-start ">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full text-sm"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password with show/hide toggle */}
            <div className="flex flex-col items-start">
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pr-10 text-sm"
                  autoComplete="current-password"
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

            {/* Login Button */}
            <Button type="submit" className="w-full font-medium text-white">
              Login
            </Button>

            {/* Forgot password */}
            <Button
              type="button"
              variant="link"
              className="w-full"
              disabled={forgotLoading}
              onClick={async () => {
                navigate("/forgot_password");
              }}
            >
              Forgot Password?
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

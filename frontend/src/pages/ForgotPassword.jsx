import { useState } from "react";
import { Eye, EyeOff, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { UserAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export default function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  const { session, login } = UserAuth();
  //console.log(session);

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

      <Card className="flex flex-col md:flex-row w-full max-w-[90vw] sm:max-w-[50vw] md:max-w-[80vw] lg:max-w-[60vw] xl:max-w-[70vw] 2xl:max-w-[50vw] rounded-2xl overflow-hidden shadow-xl border border-border p-0 gap-0">
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
          
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-14">
            Forgot Password
          </h2>

          <form className="space-y-5">
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

            {/* Forgot password */}
            <Button
              type="button"
              className="w-full text-white"
              disabled={forgotLoading}
              onClick={async () => {
                if (!email) return toast.error("Enter your email first.");
                setForgotLoading(true);
                const loadingToastId = toast.loading("Sending reset link...");
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/update_password`,
                });
                toast.dismiss(loadingToastId);
                setForgotLoading(false);
                if (error) toast.error(error.message);
                else toast.success("Check your email for the reset link!");
              }}
            >
              {forgotLoading ? <Spinner className="size-6" /> : "Send Reset Link"}
            </Button>

            {/* Back Button */}
            <Button variant="link" type="submit" className="w-full"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

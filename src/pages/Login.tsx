import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);

      if (session?.user?.email) {
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', session.user.email)
          .maybeSingle();

        console.log("Admin check:", { adminUser, adminError });

        if (adminUser) {
          console.log("Admin user found, redirecting to admin");
          navigate('/admin');
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: "jimmy.pavlatos@gmail.com", // Hardcoded for testing
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
      } else {
        toast.success("Magic link sent! Check your email.");
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-gray-600">Click below to receive a magic link</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <Input
            type="email"
            value="jimmy.pavlatos@gmail.com"
            disabled
            className="mt-1"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Sending magic link..." : "Send Magic Link"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
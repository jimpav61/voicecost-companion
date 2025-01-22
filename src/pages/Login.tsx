import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Checking session:', { session, sessionError });

        if (!session) {
          console.log('No session found, redirecting to login');
          return;
        }

        console.log('Session found for user:', session.user.email);

        // Check if the user is an admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', session.user.email)
          .maybeSingle();

        console.log('Admin check result:', { adminUser, adminError });

        if (adminError) {
          console.error('Admin check error:', adminError);
          toast.error("Error verifying admin status");
          return;
        }

        if (!adminUser) {
          console.log('Not an admin user:', session.user.email);
          toast.error("Access denied. Only admin users can access this page.");
          return;
        }

        console.log('Admin access granted for:', session.user.email);
        navigate('/admin');
      } catch (error) {
        console.error('Admin check error:', error);
        toast.error("Error checking admin status");
      }
    };

    // Handle redirect with error
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    if (error) {
      console.error("Auth redirect error:", error, errorDescription);
      toast.error(errorDescription || "Authentication error");
      return;
    }

    checkSession();
  }, [navigate, searchParams]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);

      if (event === 'SIGNED_IN' && session?.user?.email) {
        try {
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('email')
            .eq('email', session.user.email)
            .maybeSingle();

          console.log("Admin check after sign in:", { adminUser });

          if (adminUser) {
            console.log("Admin user found after sign in, redirecting to admin");
            navigate('/admin');
          } else {
            console.log("Not an admin user");
            toast.error("Access denied. Only admin users can access this page.");
            await supabase.auth.signOut();
          }
        } catch (error) {
          console.error("Admin check error:", error);
          toast.error("Error checking admin status");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: "jimmy.pavlatos@gmail.com",
        options: {
          emailRedirectTo: 'https://preview--voicecost-companion.lovable.app/login'
        }
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message);
      } else {
        toast.success("Magic link sent! Check your email.");
      }
    } catch (error) {
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
'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const { user, login, register, signInWithGoogle } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const redirectUrl = searchParams.get('redirect') || '/';

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast({
        title: "Google Login Failed",
        description: err.message || "Failed to initiate Google sign-in.",
        variant: "destructive"
      });
      setIsGoogleLoading(false);
    }
  };

  // Register form state
  const [regUser, setRegUser] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    }
  }, [user, router, redirectUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser || !loginPass) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoginLoading(true);
    const res = await login(loginUser, loginPass);
    setIsLoginLoading(false);

    if (res.success) {
      toast({
        title: "Welcome Back!",
        description: res.message,
        className: "bg-primary text-primary-foreground border-none shadow-xl"
      });
      
      if (res.user?.isAdmin) {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    } else {
      toast({
        title: "Login Failed",
        description: res.message,
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUser || !regName || !regPhone || !regAddress) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsRegLoading(true);
    const res = await register(regUser, regName, regPhone, regAddress);
    setIsRegLoading(false);

    if (res.success) {
      toast({
        title: "Account Created!",
        description: res.message,
        className: "bg-primary text-primary-foreground border-none shadow-xl"
      });
      // Pre-fill login
      setLoginUser(regUser);
      setLoginPass('123'); // Default password
    } else {
      toast({
        title: "Registration Failed",
        description: res.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/60 p-1 rounded-xl h-auto gap-1 border">
          <TabsTrigger value="login" className="rounded-lg py-2.5 text-sm font-semibold transition-all">
            Login
          </TabsTrigger>
          <TabsTrigger value="register" className="rounded-lg py-2.5 text-sm font-semibold transition-all">
            Register
          </TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value="login">
          <Card className="border shadow-md rounded-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-headline text-center">Login to Sweet Surprise</CardTitle>
              <CardDescription className="text-center">
                Enter your details to log in to your account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username</Label>
                  <Input 
                    id="login-username" 
                    placeholder="Enter your username" 
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" disabled={isLoginLoading || isGoogleLoading} className="w-full bg-primary text-primary-foreground font-semibold flex items-center justify-center space-x-2 h-11">
                  <LogIn className="w-4 h-4" />
                  <span>{isLoginLoading ? 'Logging in...' : 'Log In'}</span>
                </Button>

                <div className="relative flex items-center justify-center w-full py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <span className="relative px-3 text-[10px] uppercase bg-card text-muted-foreground font-semibold">Or continue with</span>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGoogleSignIn} 
                  disabled={isLoginLoading || isGoogleLoading} 
                  className="w-full flex items-center justify-center space-x-2 border-primary/20 hover:bg-primary/5 h-11"
                >
                  <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign in with Google</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value="register">
          <Card className="border shadow-md rounded-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-headline text-center">Create an Account</CardTitle>
              <CardDescription className="text-center">
                Register to order delicious customized treats.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username</Label>
                  <Input 
                    id="reg-username" 
                    placeholder="Choose a unique username" 
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input 
                    id="reg-name" 
                    placeholder="Enter your full name" 
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone Number</Label>
                  <Input 
                    id="reg-phone" 
                    placeholder="Enter your 10 digit number" 
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-address">Delivery Address</Label>
                  <Input 
                    id="reg-address" 
                    placeholder="Enter your full address" 
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" disabled={isRegLoading} className="w-full bg-primary text-primary-foreground font-semibold flex items-center justify-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>{isRegLoading ? 'Registering...' : 'Register'}</span>
                </Button>
                <p className="text-xs text-center text-muted-foreground leading-normal">
                  Note: For demo convenience, the registered account password will default to "123".
                </p>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

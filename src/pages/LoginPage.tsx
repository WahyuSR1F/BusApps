import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Bus, Eye, EyeOff, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAppName } from "@/hooks/useContactSettings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (user) => {
      navigate(user.role === "admin" ? "/dashboard" : "/", { replace: true });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!captchaToken) {
      setCaptchaError(true);
      return;
    }
    loginMutation.mutate({ email, password, turnstileToken: captchaToken });
  }

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">{useAppName()}</span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Masuk ke akun Anda</CardTitle>
            <CardDescription>
              Login dengan email dan password untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </Field>
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Password Anda"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                      aria-label={
                        showPassword ? "Sembunyikan password" : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </Field>

                {justRegistered && (
                  <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    Pendaftaran berhasil! Silakan login.
                  </p>
                )}

                <TurnstileWidget
                  onToken={(token) => {
                    setCaptchaToken(token);
                    setCaptchaError(false);
                  }}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => {
                    setCaptchaToken(null);
                    setCaptchaError(true);
                  }}
                />
                {captchaError && !captchaToken && (
                  <FieldError>
                    Verifikasi keamanan belum selesai. Muat ulang halaman dan
                    coba lagi.
                  </FieldError>
                )}

                {error && <FieldError>{error}</FieldError>}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </FieldGroup>
            </form>

            <p className="text-sm text-center text-slate-500 mt-6">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Daftar sekarang
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

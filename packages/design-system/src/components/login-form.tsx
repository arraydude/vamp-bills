import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import type { FormEvent } from "react";

type LoginFormMode = "login" | "signup";

type LoginFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  mode?: LoginFormMode;
  onSubmit?: (data: { email: string; password: string; name?: string }) => void;
  onGoogleSignIn?: () => void;
  onModeChange?: (mode: LoginFormMode) => void;
  isPending?: boolean;
  error?: string | null;
};

export function LoginForm({
  className,
  mode = "login",
  onSubmit,
  onGoogleSignIn,
  onModeChange,
  isPending = false,
  error,
  ...props
}: LoginFormProps) {
  const isSignup = mode === "signup";

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string | null;
    onSubmit?.({ email, password, ...(name ? { name } : {}) });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{isSignup ? "Create an account" : "Login to your account"}</CardTitle>
          <CardDescription>
            {isSignup
              ? "Enter your details below to create your account"
              : "Enter your email below to login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && <FieldError>{error}</FieldError>}
              {isSignup && (
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" name="name" type="text" placeholder="John Doe" required />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  {!isSignup && (
                    <a
                      href="#"
                      className="ms-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? isSignup
                      ? "Creating account..."
                      : "Signing in..."
                    : isSignup
                      ? "Sign up"
                      : "Login"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isPending}
                  onClick={onGoogleSignIn}
                >
                  {isSignup ? "Sign up with Google" : "Login with Google"}
                </Button>
                <FieldDescription className="text-center">
                  {isSignup ? (
                    <>
                      Already have an account?{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onModeChange?.("login");
                        }}
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Login
                      </a>
                    </>
                  ) : (
                    <>
                      Don&apos;t have an account?{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onModeChange?.("signup");
                        }}
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Sign up
                      </a>
                    </>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

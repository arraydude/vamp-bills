import { useForm } from "@tanstack/react-form";
import { createRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { z } from "zod";

import { useAuth } from "@/lib/use-auth.ts";
import { rootRoute } from "@/routes/root.tsx";

function sanitizeRedirect(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/bills";
  return value;
}

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
  mode: z.enum(["login", "signup"]).optional().catch(undefined),
});

const loginFormSchema = z.object({
  name: z.string(),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupFormSchema = loginFormSchema.extend({
  name: z.string().min(1, "Name is required"),
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: (search): z.output<typeof loginSearchSchema> => loginSearchSchema.parse(search),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isPending) return;
    if (context.auth.data) {
      throw redirect({ to: sanitizeRedirect(search.redirect) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectParam, mode } = loginRoute.useSearch();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, isTransitioning, error: authError } = useAuth();
  const target = sanitizeRedirect(redirectParam);
  const isSignup = mode === "signup";

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onSubmit: isSignup ? signupFormSchema : loginFormSchema },
    onSubmit: async ({ value }) => {
      if (isSignup) {
        const { ok } = await signUp(value);
        if (ok) navigate({ to: target });
      } else {
        const { ok } = await signIn(value);
        if (ok) navigate({ to: target });
      }
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <FieldGroup>
                {authError && <FieldError>{authError}</FieldError>}

                {isSignup && (
                  <form.Field name="name">
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          placeholder="John Doe"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldError
                          errors={field.state.meta.errors.map((err) =>
                            typeof err === "string" ? { message: err } : (err ?? undefined),
                          )}
                        />
                      </Field>
                    )}
                  </form.Field>
                )}

                <form.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="m@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError
                        errors={field.state.meta.errors.map((err) =>
                          typeof err === "string" ? { message: err } : (err ?? undefined),
                        )}
                      />
                    </Field>
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError
                        errors={field.state.meta.errors.map((err) =>
                          typeof err === "string" ? { message: err } : (err ?? undefined),
                        )}
                      />
                    </Field>
                  )}
                </form.Field>

                <Field>
                  <Button type="submit" disabled={isTransitioning}>
                    {isTransitioning
                      ? isSignup
                        ? "Creating account..."
                        : "Signing in..."
                      : isSignup
                        ? "Create account"
                        : "Login"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isTransitioning}
                    onClick={() => signInWithGoogle({ callbackURL: target })}
                  >
                    {isSignup ? "Sign up with Google" : "Login with Google"}
                  </Button>
                </Field>

                <p className="text-center text-sm text-muted-foreground">
                  {isSignup ? (
                    <>
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        search={{ redirect: redirectParam }}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Log in
                      </Link>
                    </>
                  ) : (
                    <>
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/login"
                        search={{ redirect: redirectParam, mode: "signup" }}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </p>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

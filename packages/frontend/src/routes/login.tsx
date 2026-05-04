import { useForm } from "@tanstack/react-form";
import { createRoute, redirect, useNavigate } from "@tanstack/react-router";
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
});

const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
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
  const { redirect: redirectParam } = loginRoute.useSearch();
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, isTransitioning, error: authError } = useAuth();
  const target = sanitizeRedirect(redirectParam);

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginFormSchema },
    onSubmit: async ({ value }) => {
      const { ok } = await signIn(value);
      if (ok) navigate({ to: target });
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
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
                    {isTransitioning ? "Signing in..." : "Login"}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isTransitioning}
                    onClick={() => signInWithGoogle({ callbackURL: target })}
                  >
                    Login with Google
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

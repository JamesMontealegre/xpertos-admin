import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input } from "@/components/ui/input";
import { login } from "./actions";

export const metadata: Metadata = { title: "Iniciar sesión" };

const URL_ERRORS: Record<string, string> = {
  sin_acceso: "Esta cuenta no tiene acceso al panel.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const errorKey = typeof searchParams.error === "string" ? searchParams.error : undefined;
  const urlError = errorKey ? URL_ERRORS[errorKey] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
            X
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Xpertos · Operación</h1>
          <p className="mt-1 text-sm text-slate-500">Inicia sesión con tu cuenta de operador.</p>
        </div>

        <div className="rounded-card border border-border bg-white p-6 shadow-sm">
          {urlError && (
            <Alert tone="error" className="mb-4">
              {urlError}
            </Alert>
          )}
          <ActionForm action={login} className="space-y-4">
            <Field label="Correo electrónico" htmlFor="email">
              <Input id="email" name="email" type="email" autoComplete="email" required placeholder="operador@xpertos.co" />
            </Field>
            <Field label="Contraseña" htmlFor="password">
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </Field>
            <SubmitButton className="w-full" pendingLabel="Ingresando…">
              Ingresar
            </SubmitButton>
          </ActionForm>
        </div>
      </div>
    </main>
  );
}

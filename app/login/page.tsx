import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl text-brand-900 dark:text-cream">Sign in</h1>
      <p className="mt-2 text-sm text-brand-700">
        New here?{" "}
        <a href="/register" className="text-brand-900 dark:text-cream underline">
          Create an account
        </a>
        .
      </p>
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}

import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl text-brand-900">Create an account</h1>
      <p className="mt-2 text-sm text-brand-700">
        Already have one?{" "}
        <a href="/login" className="text-brand-900 underline">
          Sign in
        </a>
        .
      </p>
      <div className="mt-8">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}

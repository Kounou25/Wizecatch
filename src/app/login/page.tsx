import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const rawNext = typeof params.next === "string" ? params.next : "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const urlError = typeof params.error === "string" ? params.error : undefined;

  return <LoginForm next={next} urlError={urlError} />;
}

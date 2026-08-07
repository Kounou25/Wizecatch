import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const urlError = typeof params.error === "string" ? params.error : undefined;

  return <SignupForm urlError={urlError} />;
}

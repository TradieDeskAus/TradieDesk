import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <SignUp />
    </div>
  );
}

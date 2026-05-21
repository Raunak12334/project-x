import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
    title: "Sign Up | Otogent Multi-Agent Platform",
    description: "Create your Otogent account to start building, testing, and scaling parallel multi-agent AI workflows.",
    alternates: {
        canonical: "https://otogent.com/signup",
    },
};

const Page = async () => <RegisterForm />;

export default Page;
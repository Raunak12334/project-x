import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
    title: "Log In | Otogent Multi-Agent Platform",
    description: "Log in to your Otogent account to manage your active AI subagents and check workflow infrastructure states.",
    alternates: {
        canonical: "https://otogent.com/login",
    },
};

const Page = async () => <LoginForm />;

export default Page;
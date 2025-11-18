import { ForgotPasswordProvider } from "@/context/AuthProvider";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return <ForgotPasswordProvider>{children}</ForgotPasswordProvider>;
}


import { SignInProvider } from "@/context/AuthProvider";

interface Props {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <SignInProvider>{children}</SignInProvider>;
}
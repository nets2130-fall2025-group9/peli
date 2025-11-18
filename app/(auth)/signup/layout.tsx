import { SignUpProvider } from "@/context/AuthProvider";

interface Props {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <SignUpProvider>{children}</SignUpProvider>;
}
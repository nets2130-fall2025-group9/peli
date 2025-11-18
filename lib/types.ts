import { SignInResource, SignUpResource } from "@clerk/types";

export type Auth = {
  isLoaded: boolean;
  signIn?: SignInResource | undefined;
  signUp?: SignUpResource | undefined;
  setActive:
    | ((config: { session: string | null }) => Promise<void>)
    | undefined;
};

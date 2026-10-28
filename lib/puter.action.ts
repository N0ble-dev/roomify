import { puter } from "@heyputer/puter.js";

export const signIn = async () => await puter.auth.signIn();
export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
  try {
    const user = await puter.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

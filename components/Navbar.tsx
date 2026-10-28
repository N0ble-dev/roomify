import { Box } from "lucide-react";
import Button from "./ui/Button";
import { useOutletContext } from "react-router";
import { useState } from "react";
import { useSuccessToast } from "./toasts/SuccessToast";
import { useNoticeToast } from "./toasts/NoticeToast";
import { useErrorToast } from "./toasts/ErrorToast";

const Navbar = () => {
  const { isLoggedIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast: showSuccess } = useSuccessToast();
  const { showToast: showNotice } = useNoticeToast();
  const { showToast: showError } = useErrorToast();

  const handleAuthClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isLoggedIn) {
        await signOut();
        showNotice("You have been signed out.");
        return;
      }

      const user = await signIn();
      if (!user) {
        showError("We couldn't finish signing you in. Please try again.");
        return;
      }
      showSuccess("You're signed in.");
    } catch (error) {
      console.error("Authentication failed:", error);
      showError(
        isLoggedIn
          ? "We couldn't sign you out. Please try again."
          : "Sign-in didn't finish. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />

            <span className="name">Roomify</span>
          </div>

          <ul className="links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
          </ul>
        </div>

        <div className="actions">
          {isLoggedIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi, ${userName}` : "Signed in"}
              </span>

              <Button
                size="sm"
                onClick={handleAuthClick}
                className="btn"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Please wait..." : "Log Out"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleAuthClick}
                size="sm"
                variant="ghost"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Please wait..." : "Log In"}
              </Button>

              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

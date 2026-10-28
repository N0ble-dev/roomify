import { Box } from "lucide-react";
import Button from "./ui/Button";
import { useOutletContext } from "react-router";

const Navbar = () => {
  const { isLoggedIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();
  const isLoading = false; // Placeholder for loading state, you can implement your own logic
  const handleAuthClick = async () => {
    if (isLoggedIn) {
      try {
        await signOut();
      } catch (e) {
        console.error(`Puter sign out failed: ${e}`);
      }

      return;
    }

    try {
      await signIn();
    } catch (e) {
      console.error(`Puter sign in failed: ${e}`);
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

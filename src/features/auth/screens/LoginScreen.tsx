import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const errors: Record<string, string> = {
  not_configured: "Google sign-in is not configured yet.",
  invalid_state: "That sign-in attempt expired. Please try again.",
  cancelled: "Google sign-in was cancelled. Please try again.",
  sign_in_failed: "This Google account could not sign in. Use the authorized account and try again.",
};

export function LoginScreen() {
  const error = new URLSearchParams(window.location.search).get("error");
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 border-r line sunk">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-forest grid place-items-center"><Icon name="sprout" className="!w-4 !h-4" /></div>
          <span className="serif text-xl">Learning OS</span>
        </div>
        <div>
          <p className="serif text-5xl leading-[1.05] max-w-md">Ninety-one weeks.<br /><span className="muted">One verified step at a time.</span></p>
          <p className="muted mt-5 max-w-sm text-sm leading-relaxed">A private study desk for the FDE and deep fundamentals roadmap. Single user, no feeds, no streaks.</p>
        </div>
        <p className="text-xs muted">Learning OS · authentication</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-8 w-8 rounded-lg bg-forest grid place-items-center"><Icon name="sprout" className="!w-4 !h-4" /></div>
            <span className="serif text-xl">Learning OS</span>
          </div>
          <h1 className="serif text-4xl">Sign in</h1>
          <p className="muted text-sm mt-2">Continue with the Google account authorized for this private desk.</p>
          {error ? <p role="alert" className="text-sm rose mt-5">{errors[error] ?? errors.sign_in_failed}</p> : null}
          <Button variant="primary" size="lg" className="w-full mt-8" type="button" onClick={() => { window.location.assign("/api/auth/google/start"); }}>
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

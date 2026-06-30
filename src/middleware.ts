export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/workspaces/:path*", "/my-tasks/:path*", "/analytics/:path*"],
};

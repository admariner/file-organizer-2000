import CheckoutButton from "@/components/ui/CheckoutButton";
import { UnkeyElements } from "./keys/client";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";
/**
 * v0 by Vercel.
 * @see https://v0.dev/t/F1suC5Yr6GV
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

export default async function Component() {
  const { userId } = auth();
  // get email
  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;
  const isPaidUser =
    (user?.publicMetadata as CustomJwtSessionClaims["publicMetadata"])?.stripe
      ?.status === "complete";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="text-center flex flex-col justiy-center items-center">
          <h2 className="text-3xl font-extrabold">
            Welcome to File Organizer 2000
          </h2>
          {process.env.ENABLE_USER_MANAGEMENT == "true" ? (
            <UnkeyElements />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Just paste this URL in the plugin settings in Obsidian and you're
              good to go!
            </p>
          )}
        </div>
        <div className="text-center">
          <ArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />

          <h2 className="mt-6 text-3xl font-extrabold">
            Download File Organizer 2000
          </h2>
          <p className="mt-2 mb-6 text-sm text-gray-600">
            Get the latest version of File Organizer 2000 to keep your files
            organized.
          </p>
          <a href="obsidian://show-plugin?id=fileorganizer2000">
            <Button className="w-full max-w-xs">Download</Button>
          </a>
          <p className="mt-2 text-sm text-gray-600">
            Requires Obsidian to be installed.
          </p>
        </div>
      </div>
      {process.env.ENABLE_USER_MANAGEMENT == "true" ? (
        <div className="absolute top-4 right-4 flex items-center gap-4">
          {!isPaidUser && <CheckoutButton />}
          <div className="text-sm text-gray-500">{email}</div>
          <SignOutButton />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

function ArrowDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

"use client";

import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="w-full flex justify-end items-center px-6 py-4 border-b border-zinc-800">
      {isSignedIn ? (
        <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
      ) : (
        <SignInButton mode="modal">
          <button className="text-sm bg-violet-600 hover:bg-violet-500 text-white font-medium px-4 py-2 rounded-full transition-colors">
            Sign in
          </button>
        </SignInButton>
      )}
    </header>
  );
}

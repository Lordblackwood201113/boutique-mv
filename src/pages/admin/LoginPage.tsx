import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="font-serif text-3xl italic font-bold text-mv-black">
          BMV Admin
        </h1>
        <p className="font-sans text-sm text-gray-500 mt-2">
          Connectez-vous pour accéder à l'administration
        </p>
      </div>
      <SignIn
        routing="path"
        path="/admin/login"
        afterSignInUrl="/admin"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'shadow-lg border border-gray-200',
          },
        }}
      />
    </div>
  );
}

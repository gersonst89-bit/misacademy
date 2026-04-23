// src/components/LoginPage/LinkLogin.tsx
import React from "react";

const LinkLogin: React.FC = () => {
  return (
    <p className="text-center text-sm text-gray-600 mt-6">
      Already have an account?{" "}
      <a href="/login" className="text-black font-medium hover:underline">
        LOGIN HERE
      </a>
    </p>
  );
};

export default LinkLogin;

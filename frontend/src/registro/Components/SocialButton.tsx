// src/components/LoginPage/SocialButtons.tsx
import React from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";

const SocialButtons: React.FC = () => {
  return (
    <div className="space-y-3">
      <button className="w-full flex items-center justify-center gap-2 border py-3 rounded-lg hover:bg-gray-100 transition">
        <FaGoogle className="text-red-500" /> Sign up with Google
      </button>
      <button className="w-full flex items-center justify-center gap-2 border py-3 rounded-lg hover:bg-gray-100 transition">
        <FaFacebook className="text-blue-600" /> Sign up with Facebook
      </button>
    </div>
  );
};

export default SocialButtons;

import React from "react";
import Form from "./Form";
import SocialButtons from "./SocialButton";
import Divider from "./Divider";
import LinkLogin from "./LinkLogin";

const RightSide: React.FC = () => {
  return (
    <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        <h3 className="text-sm text-gray-500 mb-2">LET’S GET YOU STARTED</h3>
        <h1 className="text-2xl font-bold mb-6">Create an Account</h1>
        <Form />
        <Divider />
        <SocialButtons />
        <LinkLogin />
      </div>
    </div>
  );
};

export default RightSide;

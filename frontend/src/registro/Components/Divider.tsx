import React from "react";

const Divider: React.FC = () => {
  return (
    <div className="flex items-center my-6">
      <div className="flex-grow border-t border-gray-300"></div>
      <span className="mx-2 text-gray-500 text-sm">Or</span>
      <div className="flex-grow border-t border-gray-300"></div>
    </div>
  );
};

export default Divider;

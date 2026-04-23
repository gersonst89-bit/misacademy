import React from "react";

const Form: React.FC = () => {
  return (
    <form className="space-y-4">
      <input
        type="text"
        placeholder="Your Name"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <div className="relative">
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute right-4 top-3 text-gray-400 cursor-pointer">
          👁️
        </span>
      </div>
      <button
        type="submit"
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
      >
        GET STARTED
      </button>
    </form>
  );
};

export default Form;

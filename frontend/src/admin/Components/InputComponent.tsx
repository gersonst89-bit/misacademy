"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  type?: string;
  className?: string;
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputComponent({
  placeholder,
  type = "text",
  className = "",
  value,
  onChange,
  ...props
}: InputProps) {
  return (
    <div className="mb-4">
      {props.label && (
        <label className="block text-sm pb-1 font-semibold text-gray-700">
          {props.label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 ${className}`}
        {...props}
      />
    </div>
  );
}

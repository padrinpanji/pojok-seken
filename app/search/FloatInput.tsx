"use client";

import { useState } from "react";

type Props = {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  type?: string;
  autoComplete?: string;
  "data-test-id"?: string;
  children?: React.ReactNode; // for appending icons etc inside wrapper
};

export default function FloatInput({
  id, name, label, value, onChange, onFocus, onBlur,
  inputMode, type = "text", autoComplete = "off",
  "data-test-id": testId, children,
}: Props) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className={`float-field${focused ? " focused" : ""}${lifted ? " lifted" : ""}`}>
      <label htmlFor={id} className="float-label">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        data-test-id={testId}
        className="float-input"
        placeholder=""
        onChange={onChange}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
      />
      {children}
    </div>
  );
}

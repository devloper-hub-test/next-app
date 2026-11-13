"use client";

import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "../keyquest.css";

const SHIFTED_SYMBOLS = '~!@#$%^&*()_+{}|:"<>?';

export const needsShift = (char?: string) =>
  !!char && (/[A-Z]/.test(char) || SHIFTED_SYMBOLS.includes(char));

// Which finger should press each key (touch typing)
const FINGERS: [string, string][] = [
  ["`1qaz~!", "left pinky"],
  ["2wsx@", "left ring finger"],
  ["3edc#", "left middle finger"],
  ["45rtfgvb$%", "left index finger"],
  ["67yuhjnm^&", "right index finger"],
  ["8ik,*<", "right middle finger"],
  ["9ol.(>", "right ring finger"],
  ["0-=p[]\;'/)_+{}|:\"?", "right pinky"],
  [" ", "thumb"],
];

export const fingerFor = (char: string) =>
  FINGERS.find(([keys]) => keys.includes(char.toLowerCase()))?.[1] ?? "";

const IGNORED_BUTTONS = new Set(["{bksp}", "{tab}", "{lock}", "{enter}", "{shift}"]);

interface OnScreenKeyboardProps {
  nextChar?: string;
  onKey: (char: string) => void; // lets touch users type by tapping
}

export function OnScreenKeyboard({ nextChar, onKey }: OnScreenKeyboardProps) {
  const shift = needsShift(nextChar);
  const next = nextChar === " " ? "{space}" : nextChar;
  const buttonTheme = [{ class: "kq-home", buttons: "f j F J" }];
  if (next) buttonTheme.push({ class: "kq-next", buttons: shift ? `${next} {shift}` : next });

  return (
    <Keyboard
      theme="hg-theme-default kq-keyboard"
      layoutName={shift ? "shift" : "default"}
      buttonTheme={buttonTheme}
      physicalKeyboardHighlight
      disableButtonHold
      onKeyPress={(button: string) => {
        if (IGNORED_BUTTONS.has(button)) return;
        onKey(button === "{space}" ? " " : button);
      }}
    />
  );
}

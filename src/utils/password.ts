import { randomInt } from "node:crypto";

export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 128;
export const DEFAULT_PASSWORD_LENGTH = 16;

// One character from each set is guaranteed, which is why MIN_PASSWORD_LENGTH equals the number of sets
const CHARACTER_SETS = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
  "!@#$%^&*()-_=+[]{};:,.<>?",
];

const ALL_CHARACTERS = CHARACTER_SETS.join("");

function pickCharacter(characters: string): string {
  return characters[randomInt(characters.length)];
}

export function generatePassword(length: number): string {
  if (!Number.isInteger(length) || length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password length must be an integer between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}.`);
  }

  const characters = CHARACTER_SETS.map((set) => pickCharacter(set));

  while (characters.length < length) {
    characters.push(pickCharacter(ALL_CHARACTERS));
  }

  // Fisher-Yates shuffle so the guaranteed characters aren't stuck at the front
  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join("");
}

export function validatePasswordLength(input: string): string | undefined {
  const trimmed = input.trim();

  if (!/^\d+$/.test(trimmed)) {
    return "Enter a number.";
  }

  const length = Number(trimmed);

  if (length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    return `Length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}.`;
  }

  return undefined;
}

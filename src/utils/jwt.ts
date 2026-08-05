export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

// Whitespace is never legal inside a JWT, so stripping it is lossless and rescues line-wrapped terminal pastes
function normalize(token: string): string {
  return token
    .trim()
    .replace(/^bearer\s+/i, "")
    .replace(/\s+/g, "");
}

function decodeSegment(segment: string, name: string): Record<string, unknown> {
  // Buffer ignores invalid base64url characters instead of throwing, so the shape has to be checked up front
  if (!BASE64URL_PATTERN.test(segment)) {
    throw new Error(`The ${name} segment is not valid base64url.`);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    throw new Error(`The ${name} segment is not valid JSON.`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`The ${name} segment is not a JSON object.`);
  }

  return parsed as Record<string, unknown>;
}

export function decodeJwt(token: string): DecodedJwt {
  const normalized = normalize(token);

  if (normalized === "") {
    throw new Error("Enter a JWT.");
  }

  const segments = normalized.split(".");

  if (segments.length !== 3) {
    throw new Error("A JWT must have 3 dot-separated segments.");
  }

  const [headerSegment, payloadSegment, signature] = segments;

  // An empty signature is legal for unsecured tokens (alg: "none"), unlike the header and payload
  if (signature !== "" && !BASE64URL_PATTERN.test(signature)) {
    throw new Error("The signature segment is not valid base64url.");
  }

  return {
    header: decodeSegment(headerSegment, "header"),
    payload: decodeSegment(payloadSegment, "payload"),
    signature,
  };
}

// Delegates to decodeJwt so the input box can never accept a token that decoding then rejects
export function validateJwt(input: string): string | undefined {
  try {
    decodeJwt(input);
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JWT.";
  }
}

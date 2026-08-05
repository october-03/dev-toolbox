import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
// import * as myExtension from '../../extension';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, generatePassword, validatePasswordLength } from "../utils/password";
import { decodeJwt, validateJwt } from "../utils/jwt";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Sample test", () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});

suite("Password Generator Test Suite", () => {
  test("generatePassword returns the requested length", () => {
    for (const length of [MIN_PASSWORD_LENGTH, 16, MAX_PASSWORD_LENGTH]) {
      assert.strictEqual(generatePassword(length).length, length);
    }
  });

  test("generatePassword includes every character class", () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const password = generatePassword(MIN_PASSWORD_LENGTH);

      assert.match(password, /[a-z]/);
      assert.match(password, /[A-Z]/);
      assert.match(password, /[0-9]/);
      assert.match(password, /[!@#$%^&*()\-_=+[\]{};:,.<>?]/);
    }
  });

  test("generatePassword produces different passwords", () => {
    assert.notStrictEqual(generatePassword(32), generatePassword(32));
  });

  test("generatePassword rejects lengths outside the supported range", () => {
    assert.throws(() => generatePassword(MIN_PASSWORD_LENGTH - 1));
    assert.throws(() => generatePassword(MAX_PASSWORD_LENGTH + 1));
    assert.throws(() => generatePassword(16.5));
  });

  test("validatePasswordLength accepts valid lengths", () => {
    assert.strictEqual(validatePasswordLength("16"), undefined);
    assert.strictEqual(validatePasswordLength(String(MIN_PASSWORD_LENGTH)), undefined);
    assert.strictEqual(validatePasswordLength(String(MAX_PASSWORD_LENGTH)), undefined);
  });

  test("validatePasswordLength rejects invalid input", () => {
    for (const input of ["", "abc", "1.5", "-8", String(MIN_PASSWORD_LENGTH - 1), String(MAX_PASSWORD_LENGTH + 1)]) {
      assert.strictEqual(typeof validatePasswordLength(input), "string");
    }
  });

  test("command is registered", async () => {
    // Activation is lazy, so activate before asking VS Code which commands exist
    const extension = vscode.extensions.all.find((candidate) => candidate.packageJSON.name === "dev-toolbox");

    assert.ok(extension, "dev-toolbox extension not found");
    await extension.activate();

    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("dev-toolbox.generatePassword"));
    assert.ok(commands.includes("dev-toolbox.decodeJwt"));
  });
});

function encodeSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

const JWT_HEADER = { alg: "HS256", typ: "JWT" };
const JWT_PAYLOAD = { sub: "1234567890", name: "Dev Toolbox", iat: 1516239022 };
const ENCODED_HEADER = encodeSegment(JWT_HEADER);
const ENCODED_PAYLOAD = encodeSegment(JWT_PAYLOAD);
const VALID_JWT = `${ENCODED_HEADER}.${ENCODED_PAYLOAD}.abcDEF123_-`;

const INVALID_JWTS = [
  "",
  "   ",
  "onlyonesegment",
  "a.b",
  "a.b.c.d",
  `!!!.${ENCODED_PAYLOAD}.abc`,
  `.${ENCODED_PAYLOAD}.abc`,
  `${ENCODED_HEADER}.a+b.abc`,
  `${ENCODED_HEADER}.${ENCODED_PAYLOAD}.a+b`,
  `${Buffer.from("not json").toString("base64url")}.${ENCODED_PAYLOAD}.abc`,
  `${ENCODED_HEADER}.${encodeSegment([1, 2])}.abc`,
  `${ENCODED_HEADER}.${encodeSegment(123)}.abc`,
];

suite("JWT Decoder Test Suite", () => {
  test("decodeJwt splits a token into header, payload, and signature", () => {
    const decoded = decodeJwt(VALID_JWT);

    assert.deepStrictEqual(decoded.header, JWT_HEADER);
    assert.deepStrictEqual(decoded.payload, JWT_PAYLOAD);
    assert.strictEqual(decoded.signature, "abcDEF123_-");
  });

  test("decodeJwt normalizes surrounding whitespace, a Bearer prefix, and line breaks", () => {
    const expected = decodeJwt(VALID_JWT);

    for (const input of [
      `  ${VALID_JWT}  `,
      `Bearer ${VALID_JWT}`,
      `bearer ${VALID_JWT}`,
      `BEARER  ${VALID_JWT}`,
      `${ENCODED_HEADER}.${ENCODED_PAYLOAD}\n.abcDEF123_-`,
    ]) {
      assert.deepStrictEqual(decodeJwt(input), expected);
    }
  });

  test("decodeJwt accepts an empty signature", () => {
    assert.strictEqual(decodeJwt(`${ENCODED_HEADER}.${ENCODED_PAYLOAD}.`).signature, "");
  });

  test("decodeJwt rejects malformed tokens", () => {
    for (const input of INVALID_JWTS) {
      assert.throws(() => decodeJwt(input), `expected ${JSON.stringify(input)} to be rejected`);
    }
  });

  test("validateJwt accepts a valid token", () => {
    assert.strictEqual(validateJwt(VALID_JWT), undefined);
  });

  test("validateJwt rejects invalid input", () => {
    for (const input of INVALID_JWTS) {
      assert.strictEqual(typeof validateJwt(input), "string");
    }
  });
});

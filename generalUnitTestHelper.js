import path from "node:path";
const LOCALE_ARRAY = ["en-US", "es-US", "fr-CA"];
const TEST_CODE_DIRECTORY = "outputFunction.test.js";
export class GeneralUnitTestHelper {
  static unitTestFileName;
  static uniqueReformattedFilePath;
  static basePath;

  /** called with __fileName */
  constructor(unitTestFileName) {
    this.basePath = path.dirname(unitTestFileName);
    const fileName = path.basename(unitTestFileName);
    this.uniqueTestFilePath = fileName;
    this.uniqueReformattedFilePath = fileName.replace(
      ".test.js",
      ".cjs"
    );
    return this.uniqueReformattedFilePath;
  }

  async runReformattedFunction(params) {
    const resolvedPath = path.resolve(
      this.basePath, this.uniqueReformattedFilePath
    );
    console.log(`Resolved path: ${resolvedPath}`);
    try {
      const reformattedFunction = require(resolvedPath);
      return await reformattedFunction(params);
    } catch (error) {
      console.error(`Error importing module at ${resolvedPath}:`, error);
      throw error;
    }
  }

  createTestCasesPerLocale(testVariables) {
    const testCases = [];
    testVariables.forEach((testVariable) => {
      LOCALE_ARRAY.forEach((locale) => {
        testCases.push({ locale: locale, ...testVariable });
      });
    });
    return testCases;
  }
  createExpectedResponseFromMultiplePrompts(
    expectedPrompt,
    dictionary,
    locale
  ) {
    return expectedPrompt
      .split(/(\s+|[.!?]+)/g) // Split by spaces, punctuation, or '*'
      .filter((key) => key.trim() !== "*") // Remove '*' from the result
      .map((key) => this.#useDictionaryToDefinePrompts(key, dictionary, locale))
      .join("");
  }

  createExpectedResponseFromArrayOfPrompts(expectedPrompt, dictionary, locale) {
    return expectedPrompt
      .map((key) => this.#useDictionaryToDefinePrompts(key, dictionary, locale))
      .join(" ");
  }

  /** get dictionary translation for key/locale pair.
   * exception: do not modify prompts that look like "<break time='200ms'/>" as well as punctuation. */
  #useDictionaryToDefinePrompts(key, dictionary, locale) {
    return !key ||
      key === "." ||
      key === "。" ||
      key.startsWith("<break") ||
      key.startsWith("time") ||
      !dictionary[key]
      ? key
      : dictionary[key][locale];
  }
}

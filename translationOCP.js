export const translateBodyFromOCP = `const translateBodyFromOCP = (prompt, templateParams, dictionary) => {
  function sanitizeQuotes(input) {
    return input.replace(/['"]/g, "");
  }

  function trimContextWS(input) {
    return input.replace(/\[\[\s*/g, "[").replace(/\s*\]\]/g, "]");
  }

  function trimExcessWS(input) {
    return input.replace(/(\s)\s+/g, "$1").replace(/\s$/g, "").replace(/^\s/g, "");
  }

  function cleanContexts(input) {
    return input.replace(/\[\[.*?\]\]/g, "");
  }

  function trimConstantDelims(input) {
    return input.replace(/\(\(\(.+?\)\)\)/g, "");
  }

  function trimConstants(input) {
    return input.replace(/\(\(\((.*?)\)\)\)/g, "($1)");
  }

  function clean(input) {
    return input
      .replace(/[.,!?\\-']/g, "")
      .replace(/\.\.*\|/g, "")
      .replace(/<.*?>/g, "")
      .replace(/&lt;.*?&gt;/g, "")
      .replace(/\(\(\(.*?\)\)\)/g, "")
      .replace(/\s+/g, " ")
      .replace(/{{.+?}}/g, "");
  }

  let constants = prompt.toString().match(/\(\(\((.*?)\)\)\)/g);
  let thisPromptInit = sanitizeQuotes(trimConstants(trimContextWS(prompt.toString())));
  let thisPrompt = trimExcessWS(thisPromptInit).toLowerCase();
  let cleanLength = clean(thisPrompt).length;
  let matchedLength = 0;
  let finalPrompt;
  let matchedEntries = Object.keys(dictionary).filter((entry) => {
    let cleanEntry = sanitizeQuotes(trimConstants(trimContextWS(entry)));
    let regexEntry = new RegExp(cleanEntry.replaceAll("[", "\\[").replaceAll("]", "\\]") + "([^A-Za-z_0-9]|\\s|$)", "i");
    return regexEntry.test(thisPrompt);
    // OR fallback:
    // return thisPrompt.indexOf(sanitizeQuotes(trimExcessWS(trimConstants(trimContextWS(entry)))).toLowerCase()) >= 0;
  });

  for (entry of matchedEntries) {
    let entryTrimmed = sanitizeQuotes(trimExcessWS(trimConstants(trimContextWS(entry)))).toLowerCase();
    let count = 0;
    let translation = dictionary[entry][templateParams.Locale];

    // en-CA fallback
    if (templateParams.Locale === "en-CA" && !dictionary[entry].hasOwnProperty("en-CA")) {
      translation = dictionary[entry]["en-US"];
    }

    thisPrompt = thisPrompt.replaceAll(entryTrimmed, function (x) {
      count += 1;
      return translation;
    });

    matchedLength += count * clean(entryTrimmed).length;
    if (matchedLength === cleanLength) break;
  }

  finalPrompt = thisPrompt;
  if (matchedLength !== cleanLength) throw new Error("IncompleteTranslationError");

  let constantPlaceholders = finalPrompt.match(/\(\(\((.*?)\)\)\)/g);
  if (constantPlaceholders) {
    if (constants && constantPlaceholders.length === constants.length) {
      constantPlaceholders.forEach((placeholder, i) => {
        finalPrompt = finalPrompt.replace(placeholder, constants[i]);
      });
    } else if (constantPlaceholders.length || !constants) {
      throw new Error("ConstantsRemainingTranslationError");
    }
  }

  finalPrompt = cleanContexts(trimConstantDelims(finalPrompt));
  let template = handlebars.compile(finalPrompt);
  return template(templateParams);
};`;

export const translateBodyOldFromOCP = `
const translateBodyOldFromOCP = (prompt, templateParams) => {
  let dictionary = ocpvars.dictionary;

  function sanitizeQuotes(input) {
    return input.replace(/['"]/g, "");
  }

  function trimContextWS(input) {
    return input.replace(/\[\[\s*/g, "[").replace(/\s*\]\]/g, "]");
  }

  function trimExcessWS(input) {
    return input.replace(/(\s)\s+/g, "$1").replace(/\s$/g, "").replace(/^\s/g, "");
  }

  function cleanContexts(input) {
    return input.replace(/\[\[.*?\]\]/g, "");
  }

  function trimConstantDelims(input) {
    return input.replace(/\(\(\(.+?\)\)\)/g, "");
  }

  function trimConstants(input) {
    return input.replace(/\(\(\((.*?)\)\)\)/g, "($1)");
  }

  function clean(input) {
    return input
      .replace(/[.,!?\\-']/g, "")
      .replace(/\.\.*\|/g, "")
      .replace(/<.*?>/g, "")
      .replace(/&lt;.*?&gt;/g, "")
      .replace(/\(\(\(.*?\)\)\)/g, "")
      .replace(/\s+/g, " ")
      .replace(/{{.+?}}/g, "");
  }

  let constants = prompt.toString().match(/\(\(\((.*?)\)\)\)/g);
  let thisPromptInit = sanitizeQuotes(trimConstants(trimContextWS(prompt.toString())));
  let thisPrompt = trimExcessWS(thisPromptInit).toLowerCase();
  let cleanLength = clean(thisPrompt).length;
  let matchedLength = 0;

  if (templateParams.Locale === "en-US") {
    finalPrompt = thisPromptInit;
    matchedLength = cleanLength;
  } else {
    let matchedEntries = Object.keys(dictionary[templateParams.Locale]).filter((entry) => {
      return thisPrompt.indexOf(sanitizeQuotes(trimExcessWS(trimConstants(trimContextWS(entry)))).toLowerCase()) >= 0;
    });

    for (entry of matchedEntries) {
      let entryTrimmed = sanitizeQuotes(trimExcessWS(trimConstants(trimContextWS(entry)))).toLowerCase();
      let count = 0;
      thisPrompt = thisPrompt.replaceAll(entryTrimmed, function (x) {
        count += 1;
        return dictionary[templateParams.Locale][entry];
      });
      matchedLength += count * clean(entryTrimmed).length;
      if (matchedLength === cleanLength) break;
    }

    finalPrompt = thisPrompt;
    if (matchedLength !== cleanLength) throw new Error("IncompleteTranslationError");

    let constantPlaceholders = finalPrompt.match(/\(\(\((.*?)\)\)\)/g);
    if (constantPlaceholders) {
      if (constants && constantPlaceholders.length === constants.length) {
        constantPlaceholders.forEach((placeholder, i) => {
          finalPrompt = finalPrompt.replace(placeholder, constants[i]);
        });
      } else if (constantPlaceholders.length || !constants) {
        throw new Error("ConstantsRemainingTranslationError");
      }
    }
  }

  finalPrompt = cleanContexts(trimConstantDelims(finalPrompt));
  let template = handlebars.compile(finalPrompt);
  return template(templateParams);
};`;

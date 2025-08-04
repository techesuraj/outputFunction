const outputFunction = (params) => {
  const ocpvars = {};
  const eta = require("eta");
  const etaObj = new eta.Eta();
  const translate = new Function(
    "dictionary",
    "etaObj",
    "prompt",
    "ocpvars",
    "templateParams",
    params.translateBody
  );

  // Dictionary Start - DO NOT CHANGE THIS COMMENT
  var dictionary = {
    ID_scheduled_payments_minimum_due_covered: {
      "en-US":
        "Those are all the payments scheduled by your next due date, and your minimum amount due is covered.",
      "es-US":
        "Esos son todos los pagos programados hasta su próxima fecha de vencimiento, y su cantidad mínima adeudada está cubierta.",
      "fr-CA":
        "Ce sont tous les paiements prévus d'ici votre prochaine date d'échéance, et votre montant minimum dû est couvert.",
    },
    ID_interest_saver_payment_prompt: {
      "en-US":
        "You’d need to pay the Interest Saver Payment amount of $<%= it.amount %> to avoid paying interest on purchases shown on your next statement while carrying your promotional balance",
      "es-US":
        "Tendría que pagar la cantidad de $<%= it.amount %> para evitar pagar intereses en las nuevas compras que aparecerán en su próximo extracto mientras mantiene su saldo promocional",
      "fr-CA":
        "Vous devez payer le montant du Paiement économiseur d’Intérêts de $<%= it.amount %> pour éviter de payer des intérêts sur les nouveaux achats figurant sur votre prochain relevé tout en conservant votre solde promotionnel.",
    },
    ID_last_statement_balance_notice: {
      "en-US":
        "Your last statement had a balance of $<%= it.lastStatementEndingBalance %>.",
      "es-US":
        "Su último extracto tenía un saldo de $<%= it.lastStatementEndingBalance %>.",
      "fr-CA":
        "Votre dernier relevé avait un solde de $<%= it.lastStatementEndingBalance %>.",
    },
    ID_last_statement_credit_notice: {
      "en-US":
        "Your last statement had a credit of $<%= it.currentStatementCredit %>.",
      "es-US":
        "Su último extracto tenía un crédito de $<%= it.currentStatementCredit %>.",
      "fr-CA":
        "Votre dernier relevé avait un crédit de $<%= it.currentStatementCredit %>.",
    },
    ID_additional_payment_notice: {
      "en-US":
        "An extra payment of $<%= it.paymentAmount %> for the payment on <%= it.paymentDate %>.",
      "es-US":
        "Un pago adicional de $<%= it.paymentAmount %> para el pago del <%= it.paymentDate %>.",
      "fr-CA":
        "Un paiement supplémentaire de $<%= it.paymentAmount %> pour le paiement du <%= it.paymentDate %>.",
    },
    ID_processing_status_notice: {
      "en-US": "that is currently processing",
      "es-US": "que está en proceso.",
      "fr-CA": "qui est actuellement en cours de traitement.",
    },
    ID_payment_scheduled_notice: {
      "en-US": "You've scheduled",
      "es-US": "Ha programado",
      "fr-CA": "Vous avez programmé",
    },
    ID_scheduled_payment_notice: {
      "en-US": "a payment of $<%= it.paymentAmount %>.",
      "es-US": "un pago de $<%= it.paymentAmount %>.",
      "fr-CA": "un paiement de $<%= it.paymentAmount %>.",
    },
    ID_scheduled_payments_info: {
      "en-US":
        "Those are all the payments scheduled by your next due date; however, the minimum amount due has not been met.",
      "es-US":
        "Estos son todos los pagos programados hasta su próxima fecha de vencimiento; sin embargo, no se ha cubierto la cantidad mínima adeudada.",
      "fr-CA":
        "Ce sont tous les paiements prévus d’ici votre prochaine date d’échéance ; cependant, le montant minimum dû n’a pas été atteint.",
    },
    ID_next_payment_due_notice: {
      "en-US":
        "Your next payment of $<%= it.currentMinimumDueAmount %> is due on <%= it.dueDate %>.",
      "es-US":
        "Su próximo pago de $<%= it.currentMinimumDueAmount %> vence el <%= it.dueDate %>.",
      "fr-CA":
        "Votre prochain paiement de $<%= it.currentMinimumDueAmount %> est dû le <%= it.dueDate %>.",
    },
    ID_another_payment_notice: {
      "en-US": "and another payment of $<%= it.paymentAmount %>.",
      "es-US": "y otro pago de $<%= it.paymentAmount %>.",
      "fr-CA": "et un autre paiement de $<%= it.paymentAmount %>.",
    },
    ID_no_payment_due_notice: {
      "en-US": "No payment is due at this time.",
      "es-US": "No hay que pagar nada en este momento.",
      "fr-CA": "Aucun paiement n’est dû pour le moment.",
    },
    ID_zero_balance_notice: {
      "en-US": "Your last statement had a zero balance.",
      "es-US": "Su último extracto tenía un saldo nulo.",
      "fr-CA": "Votre dernier relevé avait un solde nul.",
    },
    ID_payment_due_notice: {
      "en-US":
        "Your payment of $<%= it.currentMinimumDueAmount %> was due on <%= it.dueDate %>.",
      "es-US":
        "Su pago de $<%= it.currentMinimumDueAmount %> vencía el <%= it.dueDate %>.",
      "fr-CA":
        "Votre paiement de $<%= it.currentMinimumDueAmount %> était dû le <%= it.dueDate %>.",
    },
    ID_amount_specified: {
      "en-US": "of $<%= it.amount %>",
      "es-US": "de $<%= it.amount %>",
      "fr-CA": "de $<%= it.amount %>",
    },
    ID_option_separator: {
      "en-US": "or",
      "es-US": "o",
      "fr-CA": "ou",
    },
    ID_promotional_balance: {
      "en-US": "promotional balance",
      "es-US": "saldo promocional",
      "fr-CA": "solde promotionnel",
    },
    ID_you_have_notice: {
      "en-US": "You have",
      "es-US": "Usted tiene",
      "fr-CA": "Vous avez",
    },
    ID_payment_notice: {
      "en-US":
        "a payment of $<%= it.paymentAmount %> for <%= it.paymentDate %>.",
      "es-US":
        "un pago de $<%= it.paymentAmount %> para <%= it.paymentDate %>.",
      "fr-CA":
        "un paiement de $<%= it.paymentAmount %> pour le <%= it.paymentDate %>.",
    },
    ID_location_label: {
      "en-US": "at",
      "es-US": "en",
      "fr-CA": "à",
    },
    ID_which_account: {
      "en-US": "account",
      "es-US": "cuenta",
      "fr-CA": "compte",
    },
    ID_time_label: {
      "en-US": "in",
      "es-US": "en",
      "fr-CA": "dans",
    },
    balance_label: {
      "en-US": "balance",
      "es-US": "",
      "fr-CA": "",
    },
    ID_payment: {
      "en-US": "a payment",
      "es-US": "un pago",
      "fr-CA": "un paiement",
    },
    ID_credit: {
      "en-US": "a credit",
      "es-US": "un crédito",
      "fr-CA": "un crédit",
    },
  };
  // Dictionary End -- DO NOT CHANGE THIS COMMENT

  var toReturn;
  try {
    var responseCode = params.wsResponseCode;
    var context = params.context || "MakePayment";
    var ineligibleAUFlag = params.ineligibleAUFlag;
    var ineligibleNoACHFlag = params.ineligibleNoACHFlag;
    var customerRole = params.customerRole || "";
    customerRole = customerRole.toLowerCase();
    var isAU = customerRole == "authorized user";
    var accountInCollections = params.accountInCollections == "true";
    var accountPastDue = params.accountPastDue == "true";
    var isCollectionOverride = params.isCollectionOverride != "false";
    var isInCollections =
      (accountPastDue || accountInCollections) && !isCollectionOverride;

    var isCustomerRoleSupported =
      customerRole != "" &&
      customerRole != "authorized user" &&
      customerRole != "coapplicant";

    var isPaymentEligible,
      isDebitCardPaymentEligible,
      ineligibilityReason,
      paymentAccounts,
      lastPostedPayment,
      paymentOptions,
      minimumPaymentAllowed,
      maximumPaymentAllowed,
      dueDate,
      earliestAvailablePaymentDate,
      latestAvailablePaymentDate,
      isCutOffReached,
      isCycleDayToday,
      isAccountCycled,
      isDueDateAfterCurrentDate,
      paymentOptionsUniqueId,
      lastUsedAccount,
      lastUsedDebitAccount,
      FailExitReason,
      responseBody;

    // addition for suggestedTokenizedPaymentAccountReferenceId
    var suggestedTokenizedPaymentAccountReferenceId;
    var okPatt = new RegExp(/2\d\d/);
    var clientErrorPatt = new RegExp(/4\d\d/);
    var serverErrorPatt = new RegExp(/5\d\d/);

    if (okPatt.test(responseCode)) {
      wsStatus = "success";
    } else if (clientErrorPatt.test(responseCode)) {
      wsStatus = "failure";
    } else if (serverErrorPatt.test(responseCode)) {
      wsStatus = "failure";
    } else {
      wsStatus = "failure";
      FailExitReason = "apiException";
    }

    if (wsStatus === "success" && params.wsResponseBody) {
      isPaymentEligible = params.wsResponseBody.isPaymentEligible;
      isDebitCardPaymentEligible =
        params.wsResponseBody.isDebitCardPaymentEligible &&
        customerRole != "authorized user";
      ineligibilityReason = params.wsResponseBody.ineligibilityReason;
      paymentAccounts = params.wsResponseBody.paymentAccounts;

      lastPostedPayment = params.wsResponseBody.lastPostedPayment;
      suggestedTokenizedPaymentAccountReferenceId =
        params.wsResponseBody.suggestedTokenizedPaymentAccountReferenceId || "";
      suggestedTokenizedDebitPaymentAccountReferenceId =
        params.wsResponseBody
          .suggestedTokenizedDebitPaymentAccountReferenceId || "";
      paymentOptions = params.wsResponseBody.paymentOptions || false;

      // rename CureAmount to MinimumPayment in case of collections account
      if (isInCollections) {
        refactorCureAmount(paymentOptions);
      }

      minimumPaymentAllowed = params.wsResponseBody.minimumPaymentAllowed;
      maximumPaymentAllowed = params.wsResponseBody.maximumPaymentAllowed;
      dueDate = params.wsResponseBody.dueDate;
      earliestAvailablePaymentDate =
        params.wsResponseBody.earliestAvailablePaymentDate;
      latestAvailablePaymentDate =
        params.wsResponseBody.latestAvailablePaymentDate;
      isCutOffReached = params.wsResponseBody.isCutOffReached;
      isCycleDayToday = params.wsResponseBody.hasOwnProperty("isCycleDayToday")
        ? params.wsResponseBody.isCycleDayToday
        : false;
      isAccountCycled = params.wsResponseBody.isAccountCycled;

      isDueDateAfterCurrentDate =
        params.wsResponseBody.isDueDateAfterCurrentDate;
      if (isDueDateAfterCurrentDate === undefined) {
        var dueDateObject = new Date(dueDate);
        dueDateObject.setHours(0, 0, 0, 0);
        var todayDateObject = new Date(params.Timestamp);
        todayDateObject = convertTZ(todayDateObject, "EST");
        todayDateObject.setHours(0, 0, 0, 0);
        isDueDateAfterCurrentDate =
          todayDateObject.getTime() < dueDateObject.getTime();
      }

      paymentOptionsUniqueId = params.wsResponseBody.paymentOptionsUniqueId;

      // if (lastPostedPayment) lastUsedAccount = getLastUsedAccount();
      if (suggestedTokenizedPaymentAccountReferenceId)
        lastUsedAccount = getLastUsedAccount();

      // if (lastPostedPayment) lastUsedDebitAccount = getLastUsedDebitAccount();
      if (suggestedTokenizedDebitPaymentAccountReferenceId)
        lastUsedDebitAccount = getLastUsedDebitAccount();

      responseBody = params.wsResponseBody;
      responseBody.paymentOptions = paymentOptions;

      if (!isPaymentEligible && context === "MakePayment") {
        if (ineligibilityReason === "No ACH accounts") {
          isPaymentEligible = true; // FailExitReason = "MakePaymentNoACHAccounts";
        } else if (
          ineligibilityReason === "User role not supported to make ID_payment"
        ) {
          FailExitReason = "MakePaymentUnsupportedUserRole";
        } else if (ineligibilityReason === "Insufficient permissions") {
          FailExitReason = "MakePaymentNoPermissions";
        } else if (
          ineligibilityReason === "No available credit card payment options"
        ) {
          FailExitReason = "MakePaymentNoOptions";
        }

        // No Fail Exit Reason, go to End Menu, for the following reasons
        else if (ineligibilityReason === "Zero balance or credit balance") {
          ineligibilityReason = "MakePaymentZeroBalance";
        } else if (
          ineligibilityReason === "You already have 3 pending payments"
        ) {
          ineligibilityReason = "MakePaymentMaxPendingPayments";
        }
      }

      if (context === "MakePayment") {
        if (ineligibleAUFlag === "true" && customerRole === "authorized user") {
          FailExitReason = "MakePaymentUnsupportedUserRole";
        }

        if (
          ineligibleNoACHFlag === "true" &&
          (!paymentAccounts ||
            (Array.isArray(paymentAccounts) && paymentAccounts.length === 0))
        ) {
          FailExitReason = "MakePaymentNoACHAccounts";
        }

        if (customerRole === "" && context === "MakePayment") {
          FailExitReason = "MakePaymentUnsupportedUserRole";
        }
      }
      if (!isCustomerRoleSupported && context == "NextPaymentInfo") {
        FailExitReason = "NextPaymentInfoUnsupportedUserRole";
      }

      // code for NextPaymentInfoPrompt
      var nextPaymentInfoPrompt;
      if (context == "NextPaymentInfo") {
        if (params.nextPaymentInfoFlag == "true") {
          nextPaymentInfoPrompt = realizeNextPaymentInfoPrompt(responseBody) || "";
        } else {
          FailExitReason = "apiException";
        }
      }

      if (FailExitReason) wsStatus = "failure";

      toReturn = {
        isPaymentEligible: isPaymentEligible,
        isDebitCardPaymentEligible: isDebitCardPaymentEligible,
        ineligibilityReason: ineligibilityReason,
        paymentAccounts: JSON.stringify(paymentAccounts),
        lastPostedPayment: JSON.stringify(lastPostedPayment),
        paymentOptions: JSON.stringify(paymentOptions),
        minimumPaymentAllowed: minimumPaymentAllowed,
        maximumPaymentAllowed: maximumPaymentAllowed,
        dueDate: dueDate,
        earliestAvailablePaymentDate: earliestAvailablePaymentDate,
        latestAvailablePaymentDate: latestAvailablePaymentDate,
        isCutOffReached: isCutOffReached,
        isCycleDayToday: isCycleDayToday,
        isAccountCycled: isAccountCycled,
        isDueDateAfterCurrentDate: isDueDateAfterCurrentDate,
        paymentInformationWSStatus: wsStatus,
        lastUsedBankAccount: lastUsedAccount,
        lastUsedDebitBankAccount: lastUsedDebitAccount,
        paymentInformationWSResponseBody: responseBody,
        paymentOptionsUniqueId: paymentOptionsUniqueId,
        nextPaymentInfoPrompt: nextPaymentInfoPrompt,
        FailExitReason: FailExitReason,
      };
    }
  } catch (e) {
    console.log("JS Exception");
    console.log(e);
    toReturn = {
      isPaymentEligible: undefined,
      isDebitCardPaymentEligible: undefined,
      ineligibilityReason: undefined,
      paymentAccounts: undefined,
      lastPostedPayment: undefined,
      paymentOptions: undefined,
      minimumPaymentAllowed: undefined,
      maximumPaymentAllowed: undefined,
      dueDate: undefined,
      earliestAvailablePaymentDate: undefined,
      latestAvailablePaymentDate: undefined,
      isCutOffReached: undefined,
      isCycleDayToday: undefined,
      isAccountCycled: undefined,
      isDueDateAfterCurrentDate: undefined,
      paymentInformationWSStatus: "failure",
      lastUsedBankAccount: undefined,
      lastUsedDebitBankAccount: undefined,
      paymentInformationWSResponseBody: undefined,
      paymentOptionsUniqueId: undefined,
      nextPaymentInfoPrompt: undefined,
      FailExitReason: "apiException",
    };
  }
  // console.log(toReturn);
  return toReturn;

  /**
   * Converts the date to the given timezone
   * @param {Date|String} date
   * @param {String} tzString timezone
   * @returns the Date converted to the given timezone, localized to en-US.
   */
  function convertTZ(date, tzString) {
    return new Date(
      (typeof date === "string" ? new Date(date) : date).toLocaleString(
        "en-US",
        {
          timeZone: tzString,
        }
      )
    );
  }

  function getLastUsedAccount() {
    var accounts = paymentAccounts.filter(function (ac) {
      return (
        ac.tokenizedPaymentAccountReferenceId ===
        suggestedTokenizedPaymentAccountReferenceId
      );
    });

    // if (accounts.length == 0) FailExitReason = "lastUsedAccountNotFound";
    if (accounts.length == 1) lastUsedAccount = accounts[0];
    // else FailExitReason = "manyLastUsedAccountsFound";
    return lastUsedAccount;
  }

  function getLastUsedDebitAccount() {
    var accounts = paymentAccounts.filter(function (ac) {
      return (
        ac.tokenizedPaymentAccountReferenceId ===
        suggestedTokenizedDebitPaymentAccountReferenceId
      );
    });

    if (accounts.length == 1) lastUsedDebitAccount = accounts[0];
    return lastUsedDebitAccount;
  }

  function realizeNextPaymentInfoPrompt(response) {
    var prompt = "";

    var nextPaymentDuePrompt = realizeNextPaymentDuePrompt(response);
    var lastStatementBalancePrompt =
      realizeLastStatementBalancePrompt(response);
    var interestSaverAmountPrompt = realizeInterestSaverAmountPrompt(response);
    var inProcessPaymentStatusPrompt =
      realizeInProcessPaymentStatusPrompt(response);
    var scheduledPaymentStatusPrompt =
      realizeScheduledPaymentStatusPrompt(response);
    var isMinimumDueCovered = response.isMinimumDueCovered;

    prompt += nextPaymentDuePrompt ? nextPaymentDuePrompt + ". " : "";
    prompt += lastStatementBalancePrompt
      ? lastStatementBalancePrompt + ". "
      : "";
    prompt += interestSaverAmountPrompt ? interestSaverAmountPrompt + ". " : "";
    prompt += inProcessPaymentStatusPrompt
      ? inProcessPaymentStatusPrompt + ". "
      : "";
    prompt += scheduledPaymentStatusPrompt
      ? scheduledPaymentStatusPrompt + ". "
      : "";

    let inProcessOrScheduledPromptPart = "";
    if (inProcessPaymentStatusPrompt || scheduledPaymentStatusPrompt) {
      inProcessOrScheduledPromptPart = isMinimumDueCovered
        ? "ID_scheduled_payments_minimum_due_covered"
        : "ID_scheduled_payments_info";
      prompt += translate(
        dictionary,
        etaObj,
        inProcessOrScheduledPromptPart,
        ocpvars,
        { Locale: params.Locale }
      );
    }

    return prompt;
  }

  function realizeNextPaymentDuePrompt(response) {
    let prompt = "";
    let translationParams = { Locale: params.Locale };
    if (
      response.currentMinimumDueAmount &&
      response.isMinimumDueCovered === false
    ) {
      let currentMinimumDueAmount = response.currentMinimumDueAmount,
        dueDate = response.dueDate;
      translationParams["currentMinimumDueAmount"] = currentMinimumDueAmount;
      translationParams["dueDate"] = dueDate;

      if (isDueDateAfterCurrentDate === false) {
        prompt = "ID_payment_due_notice";
      } else {
        prompt = "ID_next_payment_due_notice";
      }

      return translate(dictionary, etaObj, prompt, ocpvars, translationParams);
    }
  }

  function realizeLastStatementBalancePrompt(response) {
    let prompt = "";
    let translationParams = { Locale: params.Locale };
    let paymentOptions = response.paymentOptions,
      lastStatementEndingBalance = response.lastStatementEndingBalance,
      currentStatementCredit = response.currentStatementCredit,
      isAccountCycled = response.isAccountCycled;

    let statementBalance =
      paymentOptions && paymentOptions.length
        ? paymentOptions.filter(
            (e) => e.paymentOptionName === "LastStatementBalance"
          )[0] || ""
        : "";

    if (lastStatementEndingBalance > 0) {
      translationParams["lastStatementEndingBalance"] =
        lastStatementEndingBalance;
      prompt = "ID_last_statement_balance_notice";
    } else if (lastStatementEndingBalance < 0 && currentStatementCredit > 0) {
      translationParams["currentStatementCredit"] = currentStatementCredit;
      prompt = "ID_last_statement_credit_notice";
    } else if (isAccountCycled && lastStatementEndingBalance === 0) {
      prompt = "ID_zero_balance_notice";
    }

    return translate(dictionary, etaObj, prompt, ocpvars, translationParams);
  }

  function realizeInterestSaverAmountPrompt(response) {
    let prompt = "";
    let translationParams = { Locale: params.Locale };
    let paymentOptions = response.paymentOptions;
    let interestSaverPayment =
      paymentOptions && paymentOptions.length
        ? paymentOptions.filter(
            (e) => e.paymentOptionName == "InterestSaverPayment"
          )[0] || ""
        : "";

    if (interestSaverPayment.amount > 0) {
      let amount = interestSaverPayment.amount;
      translationParams["amount"] = amount;
      prompt = "ID_interest_saver_payment_prompt";
    }

    return translate(dictionary, etaObj, prompt, ocpvars, translationParams);
  }

  function realizeInProcessPaymentStatusPrompt(response) {
    let payments = response.payments;
    let inProcessPayments =
      payments && payments.length
        ? payments.filter((e) => e.paymentStatus == "INPROCESS") || ""
        : "";

    let translationParams = { Locale: params.Locale };
    var inProcessPrompt =
      inProcessPayments && inProcessPayments.length > 0
        ? "ID_you_have_notice"
        : "";
    inProcessPrompt =
      inProcessPrompt.length > 0
        ? translate(
            dictionary,
            etaObj,
            inProcessPrompt,
            ocpvars,
            translationParams
          ) + " "
        : "";

    let promptPart = "";

    if (inProcessPayments && inProcessPayments.length > 0) {
      inProcessPayments.forEach((payment, index) => {
        let paymentAmount = payment.amount;
        translationParams["paymentAmount"] = paymentAmount;

        if (
          inProcessPayments.length > 1 &&
          inProcessPayments.length - 1 == index
        ) {
          promptPart = "ID_another_payment_notice";
        } else {
          promptPart = "ID_scheduled_payment_notice";
        }

        promptPart = translate(
          dictionary,
          etaObj,
          promptPart,
          ocpvars,
          translationParams
        );
        inProcessPrompt += promptPart;
        if (inProcessPayments.length - 1 > index) {
          inProcessPrompt += ", ";
        }
      });

      promptPart = "ID_processing_status_notice";
      promptPart =
        " " +
        translate(dictionary, etaObj, promptPart, ocpvars, translationParams);
      inProcessPrompt += promptPart;
    }

    return inProcessPrompt;
  }

  function realizeScheduledPaymentStatusPrompt(response) {
    let payments = response.payments;
    let scheduledPayments =
      payments && payments.length
        ? payments.filter((e) => e.paymentStatus == "SCHEDULED") || ""
        : "";

    let translationParams = { Locale: params.Locale };
    let scheduledPrompt =
      scheduledPayments && scheduledPayments.length > 0
        ? "ID_payment_scheduled_notice"
        : "";

    scheduledPrompt =
      scheduledPrompt.length > 0
        ? translate(
            dictionary,
            etaObj,
            scheduledPrompt,
            ocpvars,
            translationParams
          ) + " "
        : "";

    let promptPart = "";

    if (scheduledPayments && scheduledPayments.length > 0) {
      scheduledPayments.forEach((payment, index) => {
        let paymentAmount = payment.amount;
        let paymentDate = payment.paymentDate;
        translationParams["paymentAmount"] = paymentAmount;
        translationParams["paymentDate"] = paymentDate;

        if (
          scheduledPayments.length > 1 &&
          scheduledPayments.length - 1 == index
        ) {
          promptPart = " ID_additional_payment_notice";
        } else {
          promptPart = " ID_payment_notice";
        }

        promptPart = translate(
          dictionary,
          etaObj,
          promptPart,
          ocpvars,
          translationParams
        );
        scheduledPrompt += promptPart;
        if (scheduledPayments.length - 1 > index) {
          scheduledPrompt += ", ";
        }
      });
    }

    return scheduledPrompt;
  }

  function refactorCureAmount(paymentOptions) {
    if (!paymentOptions || !Array.isArray(paymentOptions)) {
      return paymentOptions;
    }
    
    paymentOptions.forEach(function (option, index) {
      if (option.paymentOptionName == "CureAmount") {
        option.paymentOptionName = "MinimumPayment";
        paymentOptions[index] = option;
      }
    });

    return paymentOptions;
  }
};

module.exports = outputFunction;

// Direct test for outputFunction.cjs
import { describe, expect, it } from "vitest";

// Import the function directly
const outputFunction = require("./outputFunction.cjs");

describe("outputFunction direct tests", () => {
  it("should handle successful 200 response", async () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        isDebitCardPaymentEligible: true,
        paymentAccounts: [{ tokenizedPaymentAccountReferenceId: "test123" }],
        paymentOptions: [{ paymentOptionName: "MinimumPayment", amount: 100 }],
        minimumPaymentAllowed: 50,
        maximumPaymentAllowed: 1000,
        dueDate: "2025-12-31",
        isDueDateAfterCurrentDate: true,
        isAccountCycled: false,
        isCutOffReached: false,
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isPaymentEligible).toBe(true);
  });

  it("should handle 400 error response", () => {
    const params = {
      wsResponseCode: "400",
      wsResponseBody: {},
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result).toBe(undefined);
  });

  it("should handle 500 error response", () => {
    const params = {
      wsResponseCode: "500",
      wsResponseBody: {},
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result).toBe(undefined);
  });

  it("should handle unauthorized user role", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: false,
        ineligibilityReason: "User role not supported to make ID_payment",
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentUnsupportedUserRole");
  });

  it("should handle No ACH accounts scenario", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: false,
        ineligibilityReason: "No ACH accounts",
        paymentAccounts: [],
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isPaymentEligible).toBe(true); // Gets overridden
  });

  it("should handle authorized user with ineligible flag", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        isDebitCardPaymentEligible: true,
      },
      context: "MakePayment",
      customerRole: "authorized user",
      ineligibleAUFlag: "true",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentUnsupportedUserRole");
  });

  it("should handle collections account with CureAmount", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        paymentOptions: [{ paymentOptionName: "CureAmount", amount: 150 }],
      },
      context: "MakePayment",
      customerRole: "Primary",
      accountInCollections: "true",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    const paymentOptions = JSON.parse(result.paymentOptions);
    expect(paymentOptions[0].paymentOptionName).toBe("CureAmount");
  });

  it("should handle NextPaymentInfo context", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        currentMinimumDueAmount: 100,
        dueDate: "2025-12-31",
        isMinimumDueCovered: false,
      },
      context: "NextPaymentInfo",
      customerRole: "Primary",
      nextPaymentInfoFlag: "true",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return dictionary["ID_next_payment_due_notice"]["en-US"].replace(/<%= it.currentMinimumDueAmount %>/g, templateParams.currentMinimumDueAmount).replace(/<%= it.dueDate %>/g, templateParams.dueDate)`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.nextPaymentInfoPrompt).toBeDefined();
  });

  it("should handle date calculation when isDueDateAfterCurrentDate is undefined", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        dueDate: "2020-01-01", // Past date
        isDueDateAfterCurrentDate: undefined,
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isDueDateAfterCurrentDate).toBe(false);
  });

  it("should handle last used account logic", () => {
    const account = { tokenizedPaymentAccountReferenceId: "test123" };
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        paymentAccounts: [account],
        suggestedTokenizedPaymentAccountReferenceId: "test123",
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.lastUsedBankAccount).toEqual(account);
  });

  it("should handle invalid response code", () => {
    const params = {
      wsResponseCode: "999", // Invalid code
      wsResponseBody: {},
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result).toBe(undefined);
  });

  it("should handle NextPaymentInfo without flag", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
      },
      context: "NextPaymentInfo",
      customerRole: "Primary",
      nextPaymentInfoFlag: "false",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("apiException");
  });

  it("should handle debit card eligibility with authorized user", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        isDebitCardPaymentEligible: true,
      },
      context: "MakePayment",
      customerRole: "authorized user",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.isDebitCardPaymentEligible).toBe(false); // AU users can't use debit
  });

  it("should handle empty customer role", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
      },
      context: "MakePayment",
      customerRole: "",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentUnsupportedUserRole");
  });

  it("should handle insufficient permissions", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: false,
        ineligibilityReason: "Insufficient permissions",
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentNoPermissions");
  });

  it("should handle zero balance scenario", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: false,
        ineligibilityReason: "Zero balance or credit balance",
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.ineligibilityReason).toBe("MakePaymentZeroBalance");
  });

  it("should handle max pending payments", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: false,
        ineligibilityReason: "You already have 3 pending payments",
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.ineligibilityReason).toBe("MakePaymentMaxPendingPayments");
  });

  it("should handle no payment options", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: false,
        ineligibilityReason: "No available credit card payment options",
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentNoOptions");
  });

  it("should handle isCycleDayToday property", () => {
    const params = {
      wsResponseCode: "200",
      wsResponseBody: {
        isPaymentEligible: true,
        isCycleDayToday: true,
      },
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = outputFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isCycleDayToday).toBe(true);
  });
});

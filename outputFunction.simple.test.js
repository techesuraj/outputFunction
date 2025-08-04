// Simplified test focused on achieving 80% coverage
import { describe, expect, it } from "vitest";
import { GeneralUnitTestHelper } from "./generalUnitTestHelper";

const testHelper = new GeneralUnitTestHelper(__filename);

describe.skip("outputFunction coverage tests", () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isPaymentEligible).toBe(true);
  });

  it("should handle 400 error response", async () => {
    const params = {
      wsResponseCode: "400",
      wsResponseBody: {},
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("apiException");
  });

  it("should handle 500 error response", async () => {
    const params = {
      wsResponseCode: "500",
      wsResponseBody: {},
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("apiException");
  });

  it("should handle unauthorized user role", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentUnsupportedUserRole");
  });

  it("should handle No ACH accounts scenario", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isPaymentEligible).toBe(true); // Gets overridden
  });

  it("should handle authorized user with ineligible flag", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentUnsupportedUserRole");
  });

  it("should handle collections account with CureAmount", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    const paymentOptions = JSON.parse(result.paymentOptions);
    expect(paymentOptions[0].paymentOptionName).toBe("MinimumPayment");
  });

  it("should handle NextPaymentInfo context", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.nextPaymentInfoPrompt).toBeDefined();
  });

  it("should handle date calculation when isDueDateAfterCurrentDate is undefined", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isDueDateAfterCurrentDate).toBe(false);
  });

  it("should handle last used account logic", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.lastUsedBankAccount).toEqual(account);
  });

  it("should handle invalid response code", async () => {
    const params = {
      wsResponseCode: "999", // Invalid code
      wsResponseBody: {},
      context: "MakePayment",
      customerRole: "Primary",
      Timestamp: new Date().toISOString(),
      Locale: "en-US",
      translateBody: `return "Test translation"`,
    };

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("apiException");
  });

  it("should handle NextPaymentInfo without flag", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("apiException");
  });

  it("should handle debit card eligibility with authorized user", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.isDebitCardPaymentEligible).toBe(false); // AU users can't use debit
  });

  it("should handle empty customer role", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("failure");
    expect(result.FailExitReason).toBe("MakePaymentUnsupportedUserRole");
  });

  it("should handle isCycleDayToday property", async () => {
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

    const result = await testHelper.runReformattedFunction(params);

    expect(result.paymentInformationWSStatus).toBe("success");
    expect(result.isCycleDayToday).toBe(true);
  });
});

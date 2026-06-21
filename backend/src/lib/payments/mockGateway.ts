export type MockPaymentResult = { success: boolean; reference: string; response: Record<string, unknown> };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function createMockPaymentIntent(amount: number, forceFail = false): Promise<MockPaymentResult> {
  await sleep(500);
  const success = !forceFail;
  return {
    success,
    reference: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    response: { provider: 'MOCK_GATEWAY', sandbox: true, amount, status: success ? 'approved' : 'declined', latencyMs: 500 }
  };
}

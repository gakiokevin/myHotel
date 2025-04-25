export const generateReceiptNumber =  (paymentId) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); 
  return `RCT-${date}-${paymentId}`;
};

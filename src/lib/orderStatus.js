export const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export const STATUS_LABELS = {
  pending: "Awaiting payment",
  paid: "Paid – to ship",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Which status an order may move to from its current one.
// "pending -> paid" is deliberately absent: only Razorpay confirms payment.
export const TRANSITIONS = {
  pending: ["cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "paid"], // "paid" = undo an accidental "shipped"
  delivered: ["shipped"],         // undo
  cancelled: [],
};
const STATUS_MAP = {
  payment: {
    pending: { category: 'pending', en: 'Payment Pending', ar: 'الدفع قيد الانتظار' },
    paid: { category: 'success', en: 'Paid', ar: 'مدفوع' },
    unpaid: { category: 'warning', en: 'Unpaid', ar: 'غير مدفوع' },
    failed: { category: 'error', en: 'Payment Failed', ar: 'فشل الدفع' },
    refunded: { category: 'neutral', en: 'Refunded', ar: 'تم رد المبلغ' },
    cancelled: { category: 'error', en: 'Payment Cancelled', ar: 'تم إلغاء الدفع' },
  },
  order: {
    pending: { category: 'pending', en: 'Pending', ar: 'قيد الانتظار' },
    draft: { category: 'pending', en: 'Pending', ar: 'قيد الانتظار' },
    received: { category: 'pending', en: 'Order Received', ar: 'تم استلام الطلب' },
    confirmed: { category: 'pending', en: 'Confirmed', ar: 'تم التأكيد' },
    processing: { category: 'pending', en: 'Processing', ar: 'قيد التجهيز' },
    in_delivery_process: { category: 'pending', en: 'In Delivery Process', ar: 'قيد التوصيل' },
    out_for_delivery: { category: 'pending', en: 'Out for Delivery', ar: 'أثناء التوصيل' },
    delivered: { category: 'success', en: 'Delivered', ar: 'تم التوصيل' },
    completed: { category: 'success', en: 'Completed', ar: 'مكتمل' },
    fulfilled: { category: 'success', en: 'Fulfilled', ar: 'تم التنفيذ' },
    cancelled: { category: 'error', en: 'Cancelled', ar: 'ملغي' },
  },
  shipment: {
    draft: { category: 'pending', en: 'Shipping Pending', ar: 'الشحن قيد الانتظار' },
    ready: { category: 'pending', en: 'Ready for Shipping', ar: 'جاهز للشحن' },
    picked_up: { category: 'pending', en: 'Picked Up', ar: 'تم استلام الشحنة' },
    in_transit: { category: 'pending', en: 'In Transit', ar: 'الشحنة في الطريق' },
    customs: { category: 'warning', en: 'At Customs', ar: 'الشحنة في الجمارك' },
    out_for_delivery: { category: 'pending', en: 'Out for Delivery', ar: 'خرج للتوصيل' },
    delivered: { category: 'success', en: 'Delivered', ar: 'تم التسليم' },
    issue: { category: 'warning', en: 'Delivery Issue', ar: 'مشكلة في التوصيل' },
    returned: { category: 'warning', en: 'Returned', ar: 'تم إرجاع الشحنة' },
    cancelled: { category: 'error', en: 'Shipping Cancelled', ar: 'تم إلغاء الشحن' },
  },
  fulfillment: {
    unfulfilled: { category: 'pending', en: 'Not Fulfilled', ar: 'لم يتم التنفيذ' },
    processing: { category: 'pending', en: 'Preparing', ar: 'قيد التحضير' },
    partial: { category: 'warning', en: 'Partially Fulfilled', ar: 'تم تنفيذ جزء من الطلب' },
    on_hold: { category: 'warning', en: 'On Hold', ar: 'معلق مؤقتاً' },
    in_delivery_process: { category: 'pending', en: 'In Delivery Process', ar: 'قيد التوصيل' },
    out_for_delivery: { category: 'pending', en: 'Out for Delivery', ar: 'أثناء التوصيل' },
    delivered: { category: 'success', en: 'Delivered', ar: 'تم التوصيل' },
    fulfilled: { category: 'success', en: 'Fulfilled', ar: 'تم التنفيذ' },
    cancelled: { category: 'error', en: 'Cancelled', ar: 'ملغي' },
  },
};

export function presentOrderStatus(kind, value, lang = 'en') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase();
  const item = STATUS_MAP[kind]?.[normalized];
  if (item)
    return {
      value: normalized,
      label: item[lang] || item.en,
      category: item.category,
      accessibleLabel: item[lang] || item.en,
      known: true,
    };
  return {
    value: normalized || 'unknown',
    label: lang === 'ar' ? 'الحالة غير متاحة' : 'Status unavailable',
    category: 'neutral',
    accessibleLabel: lang === 'ar' ? 'الحالة غير متاحة' : 'Status unavailable',
    known: false,
  };
}

export const ALLOWED_ORDER_STATUSES = {
  payment: Object.keys(STATUS_MAP.payment),
  order: Object.keys(STATUS_MAP.order),
  fulfillment: Object.keys(STATUS_MAP.fulfillment),
  shipment: Object.keys(STATUS_MAP.shipment),
};

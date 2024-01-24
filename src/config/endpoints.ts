export const endpoints = {
  mtn: {
    preApproval: "https://proxy.momoapi.mtn.com/collection/v2_0/preapproval",
    collectionTokenGeneration: "https://proxy.momoapi.mtn.com/collection/token/",
    requestToPay: "https://proxy.momoapi.mtn.com/collection/v1_0/requesttopay",
    transfer: "https://proxy.momoapi.mtn.com/disbursement/v1_0/transfer",
    all: `/platform-admin/comments`,
    orderId: (id: string) => `/platform-admin/comments?orderId=${id}`,
  },
  hubtel: {
    smsApi: "https://smsc.hubtel.com/v1/messages/send",
  },
};

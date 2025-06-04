export type GetSignMessageVersionAPIResponse = number;

export type GetAccountAPIResponse = {
  lastSignedVersion: number | null;
};

export type GetSignMessageAPIResponse = {
  message: string;
  version: number;
  requestId: string;
};

export type PostSignatureAPIResponse = {
  success: boolean;
};

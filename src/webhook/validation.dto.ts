export class ValidationPayload {
  plain_token: string;
  event_ts: string;
}

export class ValidationResponse {
  plain_token: string;
  signature: string;
}

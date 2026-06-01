import request from "superagent";

export type TranslateCallback = (
  gloss?: string,
  error?: string | Error
) => void;

export default class GlosaTranslator {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  translate(text: string, domain: string, callback: TranslateCallback): void {
    const time = 30000; // 30s
    let hasTimeout = false;

    const timeout = setTimeout(() => {
      hasTimeout = true;
      callback(undefined, "timeout_error");
    }, time);

    request
      .post(this.endpoint)
      .send({ text, domain })
      .end((err, response) => {
        if (hasTimeout) return;

        clearTimeout(timeout);
        if (err) callback(undefined, err);
        else callback(response.text);
      });
  }
}

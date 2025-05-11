import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { LOCALSTACK_ENDPOINT } from './helpers';

export type Seconds = number;
export type HttpRequestConfig = {
  headers?: AxiosRequestConfig['headers'];
  timeout?: Seconds;
};
export type HttpRequestResponse<T> = AxiosResponse<T>;

export class HttpClient {
  public async post<TDATA, TOUTPUT>(url: string, data: TDATA, config: HttpRequestConfig): Promise<HttpRequestResponse<TOUTPUT>> {
    return axios.post(url, data, this.getHeaders(config));
  }

  public async postApiGateway<TDATA, TOUTPUT>(data: TDATA): Promise<HttpRequestResponse<TOUTPUT>> {
    const url = `${LOCALSTACK_ENDPOINT}/restapis/000000000000/test/_user_request_`;
    return this.post(url, data, this.getHeaders({}));
  }

  private getHeaders({ headers, timeout = 20 }: HttpRequestConfig): AxiosRequestConfig {
    return {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: timeout * 1000,
    };
  }
}

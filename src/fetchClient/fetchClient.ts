import { joinUrl } from "../utils/strings.js";

type InterceptorProps = {
  baseUrl: string;
  endpoint: string;
  body?: unknown;
};

type Interceptor = (
  requestInit: Partial<RequestInit>,
  props: InterceptorProps
) => Promise<Partial<RequestInit>>;

export class FetchClient {
  private interceptors: Interceptor[] = [];

  constructor(public readonly baseUrl: string) {}

  public static create(baseUrl: string) {
    return new FetchClient(baseUrl);
  }

  public addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor);
  }

  public async get<TData>(endpoint: string) {
    const url = joinUrl(this.baseUrl, endpoint);

    let config: RequestInit = { method: "GET" };
    config = await this.applyInterceptors(config, {
      baseUrl: this.baseUrl,
      endpoint,
    });

    return this.errorBoundary<TData>(fetch(url, config));
  }

  public async post<TData>(endpoint: string, body: unknown) {
    const url = joinUrl(this.baseUrl, endpoint);

    let config: RequestInit = {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    };
    config = await this.applyInterceptors(config, {
      baseUrl: this.baseUrl,
      endpoint,
      body,
    });

    return this.errorBoundary<TData>(fetch(url, config));
  }

  public async delete<TData>(endpoint: string, body?: unknown) {
    const url = joinUrl(this.baseUrl, endpoint);

    let config: RequestInit = {
      method: "DELETE",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    };
    config = await this.applyInterceptors(config, {
      baseUrl: this.baseUrl,
      endpoint,
      body,
    });

    return this.errorBoundary<TData>(fetch(url, config));
  }

  private async errorBoundary<TData>(resp: Promise<Response>) {
    const response = await resp;

    if (!response.ok) {
      throw response;
    }

    return response.json() as Promise<TData>;
  }

  private async applyInterceptors(
    initialConfig: RequestInit,
    props: InterceptorProps
  ): Promise<RequestInit> {
    let config = initialConfig;

    for (const interceptor of this.interceptors) {
      config = await interceptor(config, props);
    }

    return config;
  }
}

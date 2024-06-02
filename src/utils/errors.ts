import { AxiosError, HttpStatusCode } from "axios";

export function handleNotFoundError(error: AxiosError) {
  if (error.response.status === HttpStatusCode.NotFound) {
    return;
  }
  throw new Error(`${error.message} ${error.response.data ?? ""}`);
}

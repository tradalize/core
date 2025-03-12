export function handleNotFoundError(response: Response) {
  if (response?.status === 404) {
    return;
  }

  console.error(response);

  throw new Error(
    `Unexpected response: ${response?.status} ${response?.statusText}`
  );
}

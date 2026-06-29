import { getCookie } from "./cookies"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://maychat.test"

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: Omit<RequestInit, "body"> & { body?: any } = {}
): Promise<T> {
  const token = getCookie("auth_token")

  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const isJson =
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData)
  if (isJson) {
    headers.set("Content-Type", "application/json")
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  if (isJson) {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  if (response.status === 204) {
    return null as unknown as T
  }

  let data
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    data = await response.json()
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const errorMessage =
      data?.message || response.statusText || "Request failed"
    throw new ApiError(errorMessage, response.status, data?.errors)
  }

  return data as T
}

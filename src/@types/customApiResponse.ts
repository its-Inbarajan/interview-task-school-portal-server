export interface IApiResponse<T> {
  message: string;
  status: number;
  success: boolean;
  response?: T;
  error?: Error;
  pagination?: {
    total_count: number;
    page: number;
    limit: number;
  };
}

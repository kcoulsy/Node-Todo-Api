export class UnauthorizedError extends Error {
  public statusCode: number;

  constructor(message?: string) {
    super(message || 'Unauthorized');
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

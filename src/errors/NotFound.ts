export class NotFoundError extends Error {
  public statusCode: number;

  constructor(message?: string) {
    super(message || 'Not found');
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

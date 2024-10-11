class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  constructor(
    message: string = 'Somthing went wrong',
    statusCode: number = 400,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

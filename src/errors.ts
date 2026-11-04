export class AppError extends Error {
  readonly status: number;
  readonly slug: string;
  readonly title: string;

  constructor(
    status: number,
    slug: string,
    title: string,
    detail: string,
    options?: ErrorOptions,
  ) {
    super(detail, options);

    this.name = new.target.name;
    this.status = status;
    this.slug = slug;
    this.title = title;
  }
}
export class NotFoundError extends AppError {
  constructor(detail: string, options?: ErrorOptions) {
    super(404, "not-found", "Resource not found", detail, options);
  }
}

export class ValidationError extends AppError {
  constructor(details: string, options?: ErrorOptions) {
    super(422, "validation", "validation failed", details, options);
  }
}

export class ConflictError extends AppError {
  constructor(details: string, options?: ErrorOptions) {
    super(409, "conflict", "Conflict", details, options);
  }
}

export class UnauthorizedError extends AppError {
  constructor(details: string, options?: ErrorOptions) {
    super(401, "unauthorized", "Unauthorized", details, options);
  }
}

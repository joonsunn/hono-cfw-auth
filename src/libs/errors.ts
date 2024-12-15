import { HTTPException } from "hono/http-exception";
import { HTTPResponseError } from "hono/types";

export class BadRequestException extends HTTPException {
  constructor(message?: string) {
    super(400, { message });
  }
}

export class UnauthorizedException extends HTTPException {
  constructor(message?: string) {
    super(401, { message });
  }
}

export class ForbiddenException extends HTTPException {
  constructor(message?: string) {
    super(403, { message });
  }
}

export class NotFoundException extends HTTPException {
  constructor(message?: string) {
    super(404, { message });
  }
}

export class ConflictException extends HTTPException {
  constructor(message?: string) {
    super(409, { message });
  }
}

export class InternalServerErrorException extends HTTPException {
  constructor(message?: string) {
    super(500, { message });
  }
}

export class NotImplementedException extends HTTPException {
  constructor(message?: string) {
    super(501, { message });
  }
}

export class BadGatewayException extends HTTPException {
  constructor(message?: string) {
    super(502, { message });
  }
}

export class ServiceUnavailableException extends HTTPException {
  constructor(message?: string) {
    super(503, { message });
  }
}

export class GatewayTimeoutException extends HTTPException {
  constructor(message?: string) {
    super(504, { message });
  }
}

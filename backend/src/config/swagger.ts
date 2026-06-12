const auth = [{ BearerAuth: [] }];

const idParam = (name = "id", description = "Numeric resource ID") => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum: 1 },
});

const jsonBody = (schema: object, required = true) => ({
  required,
  content: {
    "application/json": { schema },
  },
});

const multipartBody = (schema: object, required = true) => ({
  required,
  content: {
    "multipart/form-data": { schema },
  },
});

const ok = (description = "Success") => ({ description });
const created = (description = "Created") => ({ description });

const schemas = {
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    additionalProperties: false,
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", example: "Password123!" },
    },
  },
  IdentifierRequest: {
    type: "object",
    required: ["identifier"],
    additionalProperties: false,
    properties: {
      identifier: { type: "string", example: "user@example.com" },
    },
  },
  ConfirmRegistrationRequest: {
    type: "object",
    required: ["email", "code"],
    additionalProperties: false,
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      code: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
    },
  },
  ConfirmForgotPasswordRequest: {
    type: "object",
    required: ["code"],
    additionalProperties: false,
    properties: {
      identifier: { type: "string", example: "user@example.com" },
      code: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
    },
  },
  ResetForgotPasswordRequest: {
    type: "object",
    required: ["resetToken", "newPassword", "confirmPassword"],
    additionalProperties: false,
    properties: {
      resetToken: { type: "string", minLength: 32 },
      newPassword: { type: "string", minLength: 8, maxLength: 128, example: "NewPassword123!" },
      confirmPassword: { type: "string", example: "NewPassword123!" },
    },
  },
  CreateUserMultipart: {
    type: "object",
    required: ["name", "cpf", "gender", "phone", "birthDate", "email", "password"],
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 3, maxLength: 100, example: "Guilherme Silva" },
      cpf: { type: "string", minLength: 11, maxLength: 11, pattern: "^\\d{11}$", example: "12345678901" },
      gender: { type: "string", enum: ["M", "F", "O"], example: "M" },
      phone: { type: "string", minLength: 10, maxLength: 15, example: "11988887777" },
      birthDate: { type: "string", format: "date", example: "1995-05-20" },
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", minLength: 8, maxLength: 128, example: "Password123!" },
      permissionLevel: { type: "string", enum: ["1", "2", "3"], default: "1" },
      avatarUrl: { type: "string", format: "binary", description: "Accepted upload field for the profile image." },
    },
  },
  UpdateUserMultipart: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 3, maxLength: 100 },
      gender: { type: "string", enum: ["M", "F", "O"] },
      phone: { type: "string", minLength: 10, maxLength: 15 },
      birthDate: { type: "string", format: "date" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8, maxLength: 128 },
      permissionLevel: { type: "string", enum: ["1", "2", "3"] },
      avatarUrl: { type: "string", format: "binary" },
    },
  },
  AdminUpdateUserRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 3, maxLength: 100 },
      gender: { type: "string", enum: ["M", "F", "O"] },
      phone: { type: "string", minLength: 10, maxLength: 15 },
      birthDate: { type: "string", format: "date" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8, maxLength: 128 },
      permissionLevel: { type: "string", enum: ["1", "2", "3"] },
    },
  },
  VehicleRequest: {
    type: "object",
    required: ["brand", "model", "color", "licensePlate", "manufactureYear", "type"],
    additionalProperties: false,
    properties: {
      brand: { type: "string", minLength: 2, maxLength: 30, example: "Toyota" },
      model: { type: "string", minLength: 2, maxLength: 25, example: "Corolla" },
      color: { type: "string", minLength: 3, maxLength: 30, example: "Preto" },
      licensePlate: { type: "string", maxLength: 10, example: "ABC1D23" },
      manufactureYear: { type: "string", pattern: "^\\d{4}$", example: "2022" },
      type: { type: "string", enum: ["CARRO", "MOTO"], example: "CARRO" },
      size: { type: "string", enum: ["PEQUENO", "MEDIO", "GRANDE"], description: "Required when type is CARRO." },
    },
  },
  UpdateVehicleRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      brand: { type: "string", minLength: 2, maxLength: 30 },
      model: { type: "string", minLength: 2, maxLength: 25 },
      color: { type: "string", minLength: 3, maxLength: 30 },
      licensePlate: { type: "string", maxLength: 10 },
      manufactureYear: { type: "string", pattern: "^\\d{4}$" },
      type: { type: "string", enum: ["CARRO", "MOTO"] },
      size: { type: "string", enum: ["PEQUENO", "MEDIO", "GRANDE"] },
    },
  },
  PropertyMultipart: {
    type: "object",
    required: ["name", "type", "totalCapacity", "number", "zipCode"],
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 3, maxLength: 70, example: "Condominio Jardim" },
      type: { type: "string", example: "RESIDENCIAL" },
      description: { type: "string", maxLength: 100 },
      totalCapacity: { type: "integer", minimum: 1, example: 20 },
      isActive: { type: "boolean", default: true },
      street: { type: "string", maxLength: 70, example: "Rua das Flores" },
      number: { type: "string", maxLength: 20, example: "100" },
      complement: { type: "string", maxLength: 100 },
      neighborhood: { type: "string", maxLength: 70, example: "Centro" },
      zipCode: { type: "string", minLength: 8, maxLength: 8, pattern: "^\\d{8}$", example: "12345000" },
      cityId: { type: "integer", minimum: 1 },
      images: { type: "array", maxItems: 3, items: { type: "string", format: "binary" } },
      files: { type: "array", maxItems: 3, items: { type: "string", format: "binary" } },
    },
  },
  UpdatePropertyMultipart: {
    type: "object",
    required: ["name", "type", "totalCapacity", "number", "zipCode"],
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 3, maxLength: 70 },
      type: { type: "string" },
      description: { type: "string", maxLength: 100 },
      totalCapacity: { type: "integer", minimum: 1 },
      isActive: { type: "boolean" },
      street: { type: "string", maxLength: 70 },
      number: { type: "string", maxLength: 20 },
      complement: { type: "string", maxLength: 100 },
      neighborhood: { type: "string", maxLength: 70 },
      zipCode: { type: "string", minLength: 8, maxLength: 8, pattern: "^\\d{8}$" },
      cityId: { type: "integer", minimum: 1 },
      imagesToRemove: {
        oneOf: [
          { type: "string", example: "[\"https://res.cloudinary.com/example/image/upload/v1/image.jpg\"]" },
          { type: "array", items: { type: "string" } },
        ],
      },
      images: { type: "array", maxItems: 3, items: { type: "string", format: "binary" } },
      files: { type: "array", maxItems: 3, items: { type: "string", format: "binary" } },
    },
  },
  AdminUpdatePropertyRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      name: { type: "string", minLength: 3, maxLength: 70 },
      type: { type: "string" },
      description: { type: "string", maxLength: 100 },
      totalCapacity: { type: "integer", minimum: 1 },
      isActive: { type: "boolean" },
      street: { type: "string", maxLength: 70 },
      number: { type: "string", maxLength: 20 },
      complement: { type: "string", maxLength: 100 },
      neighborhood: { type: "string", maxLength: 70 },
      zipCode: { type: "string", minLength: 8, maxLength: 8, pattern: "^\\d{8}$" },
      cityId: { type: "integer", minimum: 1 },
      imagesToRemove: {
        oneOf: [
          { type: "string", example: "[\"https://res.cloudinary.com/example/image/upload/v1/image.jpg\"]" },
          { type: "array", items: { type: "string" } },
        ],
      },
    },
  },
  SpotAvailability: {
    type: "object",
    additionalProperties: false,
    properties: {
      startDate: { type: "string", nullable: true, format: "date", example: "2026-06-01" },
      endDate: { type: "string", nullable: true, format: "date", example: "2026-12-31" },
      weekdays: { type: "integer", minimum: 1, maximum: 127, default: 127, example: 127 },
      startTime: { type: "string", pattern: "^([01]\\d|2[0-3]):([0-5]\\d)(?::([0-5]\\d))?$", default: "00:00:00" },
      endTime: { type: "string", pattern: "^([01]\\d|2[0-3]):([0-5]\\d)(?::([0-5]\\d))?$", default: "23:59:59" },
    },
  },
  GenerateSpotsMultipart: {
    type: "object",
    required: ["allowedVehicles"],
    additionalProperties: false,
    properties: {
      count: { type: "integer", minimum: 1, default: 1, example: 2 },
      price: { type: "number", minimum: 0, default: 0, example: 20 },
      size: { type: "number", minimum: 0, maximum: 999.99, default: 12.5, example: 12.5 },
      isCovered: { type: "boolean", default: true },
      prefix: { type: "string", maxLength: 10, default: "VAGA-", example: "A-" },
      allowedVehicles: {
        type: "string",
        description: "JSON array, comma-separated list, or single value accepted by Zod.",
        example: "[\"CARRO\",\"MOTO\"]",
      },
      availability: {
        type: "string",
        description: "JSON object matching SpotAvailability.",
        example: "{\"weekdays\":127,\"startTime\":\"08:00\",\"endTime\":\"18:00\"}",
      },
      images: { type: "array", items: { type: "string", format: "binary" } },
      files: { type: "array", items: { type: "string", format: "binary" } },
    },
  },
  UpdateSpotMultipart: {
    type: "object",
    additionalProperties: false,
    properties: {
      isCovered: { type: "boolean" },
      price: { type: "number", minimum: 0, maximum: 999999.99 },
      size: { type: "number", minimum: 0, maximum: 999.99 },
      allowedVehicles: { type: "string", example: "[\"CARRO\"]" },
      availability: { type: "string", example: "{\"startTime\":\"08:00\",\"endTime\":\"18:00\"}" },
      identifier: { type: "string", maxLength: 70 },
      imageUrl: { type: "string", format: "binary" },
      image: { type: "string", format: "binary" },
      file: { type: "string", format: "binary" },
      images: { type: "string", format: "binary" },
      files: { type: "string", format: "binary" },
    },
  },
  UpdateSpotStatusRequest: {
    type: "object",
    required: ["status"],
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["DISPONIVEL", "INDISPONIVEL", "OCUPADA"] },
    },
  },
  EvaluateSpotRequest: {
    type: "object",
    required: ["status"],
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["APROVADA", "RECUSADA"], example: "APROVADA" },
      rejectionReason: { type: "string", maxLength: 255 },
    },
  },
  ToggleUserBlockRequest: {
    type: "object",
    required: ["blocked"],
    properties: {
      blocked: { type: "boolean", example: true },
    },
  },
  ToggleSpotActiveRequest: {
    type: "object",
    required: ["isActive"],
    properties: {
      isActive: { type: "boolean", example: true },
    },
  },
  DeleteSpotAdminRequest: {
    type: "object",
    required: ["propertyId"],
    properties: {
      propertyId: { type: "integer", minimum: 1 },
    },
  },
  CreateReservationRequest: {
    type: "object",
    required: ["spotId", "vehicleId", "startDate", "endDate"],
    properties: {
      spotId: { type: "integer", minimum: 1 },
      vehicleId: { type: "integer", minimum: 1 },
      startDate: { type: "string", format: "date", example: "2026-06-01" },
      endDate: { type: "string", format: "date", example: "2026-06-05" },
    },
  },
  CreateReviewRequest: {
    type: "object",
    required: ["reservationId", "rating"],
    additionalProperties: false,
    properties: {
      reservationId: { type: "integer", minimum: 1 },
      rating: { type: "integer", minimum: 1, maximum: 5 },
      comment: { type: "string", maxLength: 500, default: "" },
    },
  },
  UpdateReviewRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      rating: { type: "integer", minimum: 1, maximum: 5 },
      comment: { type: "string", maxLength: 500 },
    },
  },
  CreateReportMultipart: {
    type: "object",
    required: ["reportedUserId", "targetType", "targetId", "reason"],
    additionalProperties: false,
    properties: {
      reportedUserId: { type: "integer", minimum: 1 },
      targetType: { type: "string", enum: ["CHAT", "SPOT"] },
      targetId: { type: "integer", minimum: 1 },
      reason: { type: "string", minLength: 5, maxLength: 500 },
      images: { type: "array", maxItems: 2, items: { type: "string", format: "binary" } },
      files: { type: "array", maxItems: 2, items: { type: "string", format: "binary" } },
    },
  },
  UpdateReportStatusRequest: {
    type: "object",
    required: ["status"],
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["PENDENTE", "EM_ANALISE", "RESOLVIDA", "RECUSADA", "REANALISE"] },
      adminNote: { type: "string", maxLength: 500 },
      suspendSpot: { type: "boolean", default: false },
    },
  },
  RequestReportReanalysisRequest: {
    type: "object",
    required: ["description"],
    additionalProperties: false,
    properties: {
      description: { type: "string", minLength: 5, maxLength: 500 },
      reason: { type: "string", maxLength: 255 },
    },
  },
  BlockUserRequest: {
    type: "object",
    required: ["blockedUserId"],
    properties: {
      blockedUserId: { type: "integer", minimum: 1 },
    },
  },
  CreateChatMessageMultipart: {
    type: "object",
    properties: {
      content: { type: "string", maxLength: 2000 },
      image_url: { type: "string", format: "uri", maxLength: 255 },
      image: { type: "string", format: "binary" },
      file: { type: "string", format: "binary" },
      imageUrl: { type: "string", format: "binary" },
    },
  },
  UpdateChatMessageRequest: {
    type: "object",
    required: ["content"],
    properties: {
      content: { type: "string", minLength: 1, maxLength: 2000 },
    },
  },
  DeleteMultipleChatsRequest: {
    type: "object",
    required: ["conversationIds"],
    properties: {
      conversationIds: { type: "array", minItems: 1, items: { type: "integer", minimum: 1 } },
    },
  },
  Success: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
      data: {},
    },
  },
};

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Vaggo API - Documentation",
    version: "1.0.0",
    description: "Documentation aligned with the current Express routes, Zod schemas, and Multer upload field names.",
  },
  servers: [
    { url: "/", description: "Current API host" },
  ],
  tags: [
    { name: "Authentication" },
    { name: "Users" },
    { name: "Vehicles" },
    { name: "Properties" },
    { name: "Spots" },
    { name: "Reservations" },
    { name: "Reviews" },
    { name: "Reports" },
    { name: "Chats" },
    { name: "Locations" },
    { name: "Admin" },
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate credentials",
        requestBody: jsonBody({ $ref: "#/components/schemas/LoginRequest" }),
        responses: { 200: ok("Authenticated"), 401: ok("Invalid credentials") },
      },
    },
    "/auth/register/resend": {
      post: {
        tags: ["Authentication"],
        summary: "Resend registration confirmation code",
        requestBody: jsonBody({ $ref: "#/components/schemas/IdentifierRequest" }),
        responses: { 200: ok("Code resent") },
      },
    },
    "/auth/register/confirm": {
      post: {
        tags: ["Authentication"],
        summary: "Confirm user registration",
        requestBody: jsonBody({ $ref: "#/components/schemas/ConfirmRegistrationRequest" }),
        responses: { 200: ok("Registration confirmed") },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token using the refreshToken cookie",
        responses: { 200: ok("Token refreshed"), 401: ok("Refresh token expired or missing") },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request password reset",
        requestBody: jsonBody({ $ref: "#/components/schemas/IdentifierRequest" }),
        responses: { 200: ok("Reset code sent") },
      },
    },
    "/auth/forgot-password/confirm": {
      post: {
        tags: ["Authentication"],
        summary: "Confirm password reset code",
        requestBody: jsonBody({ $ref: "#/components/schemas/ConfirmForgotPasswordRequest" }),
        responses: { 200: ok("Code verified") },
      },
    },
    "/auth/forgot-password/reset": {
      post: {
        tags: ["Authentication"],
        summary: "Reset password",
        requestBody: jsonBody({ $ref: "#/components/schemas/ResetForgotPasswordRequest" }),
        responses: { 200: ok("Password reset") },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out",
        security: auth,
        responses: { 200: ok("Logged out") },
      },
    },

    "/users": {
      post: {
        tags: ["Users"],
        summary: "Create user account",
        requestBody: multipartBody({ $ref: "#/components/schemas/CreateUserMultipart" }),
        responses: { 201: created("User created") },
      },
    },
    "/users/admin/search": {
      get: {
        tags: ["Users"],
        summary: "Search users",
        security: auth,
        parameters: [
          { name: "email", in: "query", schema: { type: "string", format: "email" } },
          { name: "name", in: "query", schema: { type: "string" } },
          { name: "phone", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: ok("Users found") },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("User found") },
      },
      put: {
        tags: ["Users"],
        summary: "Update user",
        security: auth,
        parameters: [idParam()],
        requestBody: multipartBody({ $ref: "#/components/schemas/UpdateUserMultipart" }, false),
        responses: { 200: ok("User updated") },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("User removed") },
      },
    },

    "/vehicles": {
      post: {
        tags: ["Vehicles"],
        summary: "Register vehicle",
        security: auth,
        requestBody: jsonBody({ $ref: "#/components/schemas/VehicleRequest" }),
        responses: { 201: created("Vehicle registered") },
      },
    },
    "/vehicles/my-vehicles": {
      get: {
        tags: ["Vehicles"],
        summary: "List current user's vehicles",
        security: auth,
        responses: { 200: ok("Vehicles listed") },
      },
    },
    "/vehicles/{id}": {
      get: {
        tags: ["Vehicles"],
        summary: "Get vehicle by ID",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Vehicle found") },
      },
      put: {
        tags: ["Vehicles"],
        summary: "Update vehicle",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/UpdateVehicleRequest" }),
        responses: { 200: ok("Vehicle updated") },
      },
      delete: {
        tags: ["Vehicles"],
        summary: "Delete vehicle",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Vehicle deleted") },
      },
    },

    "/properties": {
      get: {
        tags: ["Properties"],
        summary: "List properties",
        responses: { 200: ok("Properties listed") },
      },
      post: {
        tags: ["Properties"],
        summary: "Create property",
        security: auth,
        requestBody: multipartBody({ $ref: "#/components/schemas/PropertyMultipart" }),
        responses: { 201: created("Property created") },
      },
    },
    "/properties/my-properties": {
      get: {
        tags: ["Properties"],
        summary: "List current user's properties",
        security: auth,
        responses: { 200: ok("Properties listed") },
      },
    },
    "/properties/{id}": {
      get: {
        tags: ["Properties"],
        summary: "Get property by ID",
        description: "Authenticated endpoint. Any logged-in user can view the property details by ID; property membership is not required.",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Property found") },
      },
      put: {
        tags: ["Properties"],
        summary: "Update property",
        security: auth,
        parameters: [idParam()],
        requestBody: multipartBody({ $ref: "#/components/schemas/UpdatePropertyMultipart" }),
        responses: { 200: ok("Property updated") },
      },
      delete: {
        tags: ["Properties"],
        summary: "Delete property",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Property deleted") },
      },
    },

    "/spots/properties/{propId}/spots": {
      get: {
        tags: ["Spots"],
        summary: "List spots in a property",
        description: "Authenticated endpoint. Any logged-in user can list active spots belonging to a property.",
        security: auth,
        parameters: [idParam("propId", "Property ID")],
        responses: { 200: ok("Spots listed") },
      },
      post: {
        tags: ["Spots"],
        summary: "Generate spots for a property",
        security: auth,
        parameters: [idParam("propId", "Property ID")],
        requestBody: multipartBody({ $ref: "#/components/schemas/GenerateSpotsMultipart" }),
        responses: { 201: created("Spots generated") },
      },
    },
    "/spots/{id}/status": {
      patch: {
        tags: ["Spots"],
        summary: "Update spot operational status",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/UpdateSpotStatusRequest" }),
        responses: { 200: ok("Spot status updated") },
      },
    },
    "/spots/properties/{propId}/spots/{id}": {
      put: {
        tags: ["Spots"],
        summary: "Update spot data",
        security: auth,
        parameters: [idParam("propId", "Property ID"), idParam()],
        requestBody: multipartBody({ $ref: "#/components/schemas/UpdateSpotMultipart" }, false),
        responses: { 200: ok("Spot updated") },
      },
      delete: {
        tags: ["Spots"],
        summary: "Delete spot",
        security: auth,
        parameters: [idParam("propId", "Property ID"), idParam()],
        responses: { 200: ok("Spot deleted") },
      },
    },

    "/reservations/search/address": {
      get: {
        tags: ["Reservations"],
        summary: "Search spots by address, CEP, or coordinates",
        description: "Use `cep` for CEP search. Numeric CEP values accidentally sent in `address` are also accepted for compatibility.",
        parameters: [
          { name: "cep", in: "query", description: "Brazilian CEP with or without punctuation.", schema: { type: "string", minLength: 8, maxLength: 9, example: "08210090" } },
          { name: "address", in: "query", description: "Free-form address. CEP-only values are treated as CEP.", schema: { type: "string", minLength: 3, example: "Rua Guamirim, Vila Jacui, Sao Paulo" } },
          { name: "lat", in: "query", schema: { type: "number", minimum: -90, maximum: 90 } },
          { name: "lng", in: "query", schema: { type: "number", minimum: -180, maximum: 180 } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "radius", in: "query", schema: { type: "number", minimum: 0, maximum: 50, default: 10 } },
        ],
        responses: {
          200: ok("Search results"),
          400: ok("Invalid or not found address/CEP"),
          503: ok("External CEP/geocoding service unavailable"),
        },
      },
    },
    "/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "List current user's reservations",
        security: auth,
        responses: { 200: ok("Reservations listed") },
      },
      post: {
        tags: ["Reservations"],
        summary: "Create reservation",
        security: auth,
        requestBody: jsonBody({ $ref: "#/components/schemas/CreateReservationRequest" }),
        responses: { 201: created("Reservation created") },
      },
    },
    "/reservations/all": {
      get: {
        tags: ["Reservations"],
        summary: "List all reservations",
        security: auth,
        responses: { 200: ok("Reservations listed") },
      },
    },
    "/reservations/owner": {
      get: {
        tags: ["Reservations"],
        summary: "List reservation requests for owned properties",
        security: auth,
        responses: { 200: ok("Owner reservations listed") },
      },
    },
    "/reservations/{id}/{action}": {
      patch: {
        tags: ["Reservations"],
        summary: "Approve, reject, or cancel a reservation",
        security: auth,
        parameters: [
          idParam(),
          { name: "action", in: "path", required: true, schema: { type: "string", enum: ["approve", "reject", "cancel"] } },
        ],
        responses: { 200: ok("Reservation status updated") },
      },
    },
    "/reservations/{id}": {
      delete: {
        tags: ["Reservations"],
        summary: "Delete reservation",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Reservation deleted") },
      },
    },

    "/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List all reviews",
        security: auth,
        parameters: [
          { name: "propertyId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "spotId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "reviewerId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "minRating", in: "query", schema: { type: "integer", minimum: 1, maximum: 5 } },
          { name: "maxRating", in: "query", schema: { type: "integer", minimum: 1, maximum: 5 } },
        ],
        responses: { 200: ok("Reviews listed") },
      },
      post: {
        tags: ["Reviews"],
        summary: "Create review",
        security: auth,
        requestBody: jsonBody({ $ref: "#/components/schemas/CreateReviewRequest" }),
        responses: { 201: created("Review created") },
      },
    },
    "/reviews/my": {
      get: {
        tags: ["Reviews"],
        summary: "List current user's reviews",
        security: auth,
        responses: { 200: ok("Reviews listed") },
      },
    },
    "/reviews/properties/{propertyId}": {
      get: {
        tags: ["Reviews"],
        summary: "List property reviews",
        parameters: [idParam("propertyId", "Property ID")],
        responses: { 200: ok("Reviews listed") },
      },
    },
    "/reviews/spots/{spotId}": {
      get: {
        tags: ["Reviews"],
        summary: "List spot reviews",
        parameters: [idParam("spotId", "Spot ID")],
        responses: { 200: ok("Reviews listed") },
      },
    },
    "/reviews/{id}": {
      put: {
        tags: ["Reviews"],
        summary: "Update review",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/UpdateReviewRequest" }),
        responses: { 200: ok("Review updated") },
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete review",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Review deleted") },
      },
    },

    "/reports": {
      post: {
        tags: ["Reports"],
        summary: "Create report",
        security: auth,
        requestBody: multipartBody({ $ref: "#/components/schemas/CreateReportMultipart" }),
        responses: { 201: created("Report created") },
      },
    },
    "/reports/my": {
      get: {
        tags: ["Reports"],
        summary: "List current user's reports",
        security: auth,
        responses: { 200: ok("Reports listed") },
      },
    },
    "/reports/{id}/reanalysis": {
      patch: {
        tags: ["Reports"],
        summary: "Request report reanalysis",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/RequestReportReanalysisRequest" }),
        responses: { 200: ok("Reanalysis requested") },
      },
    },

    "/chats": {
      get: {
        tags: ["Chats"],
        summary: "List conversations",
        security: auth,
        responses: { 200: ok("Chats listed") },
      },
    },
    "/chats/block": {
      post: {
        tags: ["Chats"],
        summary: "Block user in chat",
        security: auth,
        requestBody: jsonBody({ $ref: "#/components/schemas/BlockUserRequest" }),
        responses: { 201: created("User blocked") },
      },
    },
    "/chats/block/{userId}": {
      delete: {
        tags: ["Chats"],
        summary: "Unblock user in chat",
        security: auth,
        parameters: [idParam("userId", "Blocked user ID")],
        responses: { 200: ok("User unblocked") },
      },
    },
    "/chats/{conversationId}/search": {
      get: {
        tags: ["Chats"],
        summary: "Search messages in a conversation",
        security: auth,
        parameters: [
          idParam("conversationId", "Conversation ID"),
          { name: "q", in: "query", required: true, schema: { type: "string", minLength: 1, maxLength: 100 } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 30 } },
        ],
        responses: { 200: ok("Messages found") },
      },
    },
    "/chats/{conversationId}": {
      get: {
        tags: ["Chats"],
        summary: "Get conversation detail",
        security: auth,
        parameters: [
          idParam("conversationId", "Conversation ID"),
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 30 } },
        ],
        responses: { 200: ok("Conversation loaded") },
      },
    },
    "/chats/{conversationId}/messages": {
      post: {
        tags: ["Chats"],
        summary: "Create chat message",
        security: auth,
        parameters: [idParam("conversationId", "Conversation ID")],
        requestBody: multipartBody({ $ref: "#/components/schemas/CreateChatMessageMultipart" }),
        responses: { 201: created("Message created") },
      },
    },
    "/chats/messages/{messageId}": {
      put: {
        tags: ["Chats"],
        summary: "Update chat message",
        security: auth,
        parameters: [idParam("messageId", "Message ID")],
        requestBody: jsonBody({ $ref: "#/components/schemas/UpdateChatMessageRequest" }),
        responses: { 200: ok("Message updated") },
      },
      delete: {
        tags: ["Chats"],
        summary: "Delete chat message",
        security: auth,
        parameters: [idParam("messageId", "Message ID")],
        responses: { 200: ok("Message deleted") },
      },
    },
    "/chats/delete-multiple": {
      post: {
        tags: ["Chats"],
        summary: "Delete multiple conversations locally",
        security: auth,
        requestBody: jsonBody({ $ref: "#/components/schemas/DeleteMultipleChatsRequest" }),
        responses: { 200: ok("Conversations deleted") },
      },
    },
    "/chats/{conversationId}/for-everyone": {
      delete: {
        tags: ["Chats"],
        summary: "Delete conversation for everyone",
        security: auth,
        parameters: [idParam("conversationId", "Conversation ID")],
        responses: { 200: ok("Conversation deleted") },
      },
    },

    "/locations/states": {
      get: {
        tags: ["Locations"],
        summary: "List Brazilian states",
        responses: { 200: ok("States listed") },
      },
    },
    "/locations/states/{stateId}/cities": {
      get: {
        tags: ["Locations"],
        summary: "List cities by state ID",
        parameters: [idParam("stateId", "State ID")],
        responses: { 200: ok("Cities listed") },
      },
    },

    "/admin/dashboard/stats": {
      get: {
        tags: ["Admin"],
        summary: "Get dashboard statistics",
        security: auth,
        responses: { 200: ok("Statistics returned") },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users",
        security: auth,
        responses: { 200: ok("Users listed") },
      },
    },
    "/admin/users/blocked/count": {
      get: {
        tags: ["Admin"],
        summary: "Count blocked users",
        security: auth,
        responses: { 200: ok("Blocked user count") },
      },
    },
    "/admin/users/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Update user as admin",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/AdminUpdateUserRequest" }, false),
        responses: { 200: ok("User updated") },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete user as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("User deleted") },
      },
    },
    "/admin/users/{id}/block": {
      patch: {
        tags: ["Admin"],
        summary: "Set user block state",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/ToggleUserBlockRequest" }),
        responses: { 200: ok("User block state updated") },
      },
    },
    "/admin/vehicles": {
      get: {
        tags: ["Admin"],
        summary: "List all vehicles",
        security: auth,
        responses: { 200: ok("Vehicles listed") },
      },
    },
    "/admin/vehicles/search": {
      get: {
        tags: ["Admin"],
        summary: "Search vehicles",
        security: auth,
        parameters: [
          { name: "id", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "licensePlate", in: "query", schema: { type: "string" } },
          { name: "email", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: ok("Vehicles found") },
      },
    },
    "/admin/vehicles/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get vehicle as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Vehicle found") },
      },
      put: {
        tags: ["Admin"],
        summary: "Update vehicle as admin",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/UpdateVehicleRequest" }),
        responses: { 200: ok("Vehicle updated") },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete vehicle as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Vehicle deleted") },
      },
    },
    "/admin/properties": {
      get: {
        tags: ["Admin"],
        summary: "List all properties",
        security: auth,
        responses: { 200: ok("Properties listed") },
      },
    },
    "/admin/properties/search": {
      get: {
        tags: ["Admin"],
        summary: "Search properties",
        security: auth,
        parameters: [
          { name: "id", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "name", in: "query", schema: { type: "string" } },
          { name: "email", in: "query", schema: { type: "string" } },
          { name: "ownerName", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: ok("Properties found") },
      },
    },
    "/admin/properties/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get property as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Property found") },
      },
      put: {
        tags: ["Admin"],
        summary: "Update property as admin",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/AdminUpdatePropertyRequest" }, false),
        responses: { 200: ok("Property updated") },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete property as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Property deleted") },
      },
    },
    "/admin/spots": {
      get: {
        tags: ["Admin"],
        summary: "List all spots",
        security: auth,
        responses: { 200: ok("Spots listed") },
      },
    },
    "/admin/spots/search": {
      get: {
        tags: ["Admin"],
        summary: "Search spots",
        security: auth,
        parameters: [
          { name: "id", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "email", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDENTE", "APROVADA", "RECUSADA"] } },
        ],
        responses: { 200: ok("Spots found") },
      },
    },
    "/admin/spots/{id}/evaluate": {
      patch: {
        tags: ["Admin"],
        summary: "Approve or reject spot",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/EvaluateSpotRequest" }),
        responses: { 200: ok("Spot evaluated") },
      },
    },
    "/admin/spots/{id}/active": {
      patch: {
        tags: ["Admin"],
        summary: "Set spot active state",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/ToggleSpotActiveRequest" }),
        responses: { 200: ok("Spot active state updated") },
      },
    },
    "/admin/spots/{id}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete spot as admin",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/DeleteSpotAdminRequest" }),
        responses: { 200: ok("Spot deleted") },
      },
    },
    "/admin/reservations": {
      get: {
        tags: ["Admin"],
        summary: "List all reservations",
        security: auth,
        responses: { 200: ok("Reservations listed") },
      },
    },
    "/admin/reservations/search": {
      get: {
        tags: ["Admin"],
        summary: "Search reservations",
        security: auth,
        parameters: [
          { name: "id", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "email", in: "query", schema: { type: "string" } },
          { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDENTE", "APROVADA", "RECUSADA", "CANCELADA"] } },
          { name: "city", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: ok("Reservations found") },
      },
    },
    "/admin/reservations/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get reservation as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Reservation found") },
      },
    },
    "/admin/reservations/{id}/force-cancel": {
      patch: {
        tags: ["Admin"],
        summary: "Force cancel reservation",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Reservation canceled") },
      },
    },
    "/admin/reports": {
      get: {
        tags: ["Admin"],
        summary: "List all reports",
        security: auth,
        responses: { 200: ok("Reports listed") },
      },
    },
    "/admin/reports/search": {
      get: {
        tags: ["Admin"],
        summary: "Search reports",
        security: auth,
        parameters: [
          { name: "id", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "email", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDENTE", "EM_ANALISE", "RESOLVIDA", "RECUSADA", "REANALISE"] } },
          { name: "targetType", in: "query", schema: { type: "string", enum: ["CHAT", "SPOT"] } },
        ],
        responses: { 200: ok("Reports found") },
      },
    },
    "/admin/reports/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get report as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Report found") },
      },
    },
    "/admin/reports/{id}/status": {
      patch: {
        tags: ["Admin"],
        summary: "Update report status",
        security: auth,
        parameters: [idParam()],
        requestBody: jsonBody({ $ref: "#/components/schemas/UpdateReportStatusRequest" }),
        responses: { 200: ok("Report updated") },
      },
    },
    "/admin/reviews": {
      get: {
        tags: ["Admin"],
        summary: "List all reviews",
        security: auth,
        responses: { 200: ok("Reviews listed") },
      },
    },
    "/admin/reviews/search": {
      get: {
        tags: ["Admin"],
        summary: "Search reviews",
        security: auth,
        parameters: [
          { name: "id", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "email", in: "query", schema: { type: "string" } },
          { name: "propertyId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "spotId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "reviewerId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "minRating", in: "query", schema: { type: "integer", minimum: 1, maximum: 5 } },
          { name: "maxRating", in: "query", schema: { type: "integer", minimum: 1, maximum: 5 } },
        ],
        responses: { 200: ok("Reviews found") },
      },
    },
    "/admin/reviews/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get review as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Review found") },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete review as admin",
        security: auth,
        parameters: [idParam()],
        responses: { 200: ok("Review deleted") },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas,
  },
};

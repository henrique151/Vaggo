// Veggo API OpenAPI 3.0 Specification Configuration

export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Veggo API - Documentation",
    description: "Welcome to the official **Veggo API** documentation. Veggo is a premium, real-time shared parking reservation platform designed to optimize urban mobility.\n\n### Key Features:\n- **Advanced Authentication & Authorization:** Multi-role RBAC (USER, MANAGER, ADMIN) with stateless JWT tokens and cookie-based Refresh Tokens.\n- **Parking Spots & Properties Batching:** Dynamic spot generation and robust multi-image Cloudinary upload integration.\n- **Real-Time Communication:** Live web-socket integrated chats with offensive language detection and user blocking.\n- **Admin Control Panel:** High-performance dashboard analytics, advanced regex search filters, and spot evaluation flows.\n- **Report & Review Systems:** Complete audit trailing for reports, manual evaluation workflows, and property rating systems.\n\n*Created with premium development practices to showcase structural and code excellence to recruiters and technical evaluators.*",
    version: "1.0.0",
    contact: {
      name: "Veggo Development Team",
      email: "support@veg_go.com"
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server"
    }
  ],
  tags: [
    { name: "Authentication", description: "Role-based token exchange and password recovery workflows" },
    { name: "Users", description: "User profile CRUD, registration, and administrative lists" },
    { name: "Vehicles", description: "Vehicle registration and ownership management" },
    { name: "Properties", description: "Real-estate property CRUD with coordinates and photo portfolios" },
    { name: "Spots (Parking)", description: "Parking spot batching, availability schedules, and CRUD" },
    { name: "Reservations", description: "Spot scheduling, pricing, state machine, and geolocation search" },
    { name: "Reviews", description: "Quality control and evaluation rating system" },
    { name: "Reports", description: "Content moderation, chat/spot reporting, and administrative reviews" },
    { name: "Chats", description: "Real-time communication, text histories, and user blocks" },
    { name: "Locations", description: "Static lists of Brazilian states and cities" },
    { name: "Admin Dashboard", description: "High-level metrics, system statistics, and master controls" }
  ],
  paths: {
    // AUTHENTICATION
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate credentials",
        description: "Exchanges valid email and password for an access token (JWT body) and refresh token (HttpOnly Cookie).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "joao@gmail.com" },
                  password: { type: "string", format: "password", example: "Password123!" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    accessToken: { type: "string", example: "eyJhbGciOiJIUzI1..." },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        email: { type: "string", example: "joao@gmail.com" },
                        role: { type: "string", example: "USER" }
                      }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Invalid credentials" }
        }
      }
    },
    "/auth/register/confirm": {
      post: {
        tags: ["Authentication"],
        summary: "Confirm user registration",
        description: "Confirms user registration using the code sent to their phone/email.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code"],
                properties: {
                  email: { type: "string", format: "email", example: "joao@gmail.com" },
                  code: { type: "string", example: "123456" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Registration confirmed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Registration confirmed successfully." }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/auth/register/resend": {
      post: {
        tags: ["Authentication"],
        summary: "Resend confirmation code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "joao@gmail.com" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Code sent successfully" }
        }
      }
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token",
        description: "Uses the HttpOnly `refreshToken` cookie to generate a fresh short-lived `accessToken`.",
        responses: {
          200: {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    accessToken: { type: "string", example: "eyJhbGciOiJIUzI1..." }
                  }
                }
              }
            }
          },
          401: { description: "Refresh token expired or missing" }
        }
      }
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request password reset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email", example: "joao@gmail.com" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Reset code sent" }
        }
      }
    },
    "/auth/forgot-password/confirm": {
      post: {
        tags: ["Authentication"],
        summary: "Confirm password reset code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code"],
                properties: {
                  email: { type: "string", example: "joao@gmail.com" },
                  code: { type: "string", example: "654321" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Code verified successfully" }
        }
      }
    },
    "/auth/forgot-password/reset": {
      post: {
        tags: ["Authentication"],
        summary: "Reset to new password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code", "password"],
                properties: {
                  email: { type: "string", example: "joao@gmail.com" },
                  code: { type: "string", example: "654321" },
                  password: { type: "string", example: "NewSecurePassword1!" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Password reset completed" }
        }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Session ended successfully" }
        }
      }
    },

    // USERS
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Create new user account",
        description: "Creates a standard USER account. Supports multipart/form-data for profile picture uploads.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["email", "password", "name", "phone", "cpf"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", format: "password", example: "MySecureP@ss1" },
                  name: { type: "string", example: "Guilherme Silva" },
                  phone: { type: "string", example: "11988887777" },
                  cpf: { type: "string", example: "12345678901" },
                  avatar: { type: "string", format: "binary", description: "Profile photo upload file" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "User registered, pending code verification" }
        }
      }
    },
    "/users/admin/search": {
      get: {
        tags: ["Users"],
        summary: "Advanced search user directory (Manager/Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "email", in: "query", schema: { type: "string" }, description: "Partial or full email search" },
          { name: "role", in: "query", schema: { type: "string", enum: ["USER", "MANAGER", "ADMIN"] } }
        ],
        responses: {
          200: { description: "List of matching users" }
        }
      }
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user profile details",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "User details object" }
        }
      },
      put: {
        tags: ["Users"],
        summary: "Update user profile details",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  phone: { type: "string" },
                  avatar: { type: "string", format: "binary" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Profile updated successfully" }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Soft delete account",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "User deactivated successfully" }
        }
      }
    },

    // VEHICLES
    "/vehicles": {
      post: {
        tags: ["Vehicles"],
        summary: "Register new vehicle",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["plate", "brand", "model", "color", "type"],
                properties: {
                  plate: { type: "string", example: "ABC1D23" },
                  brand: { type: "string", example: "Toyota" },
                  model: { type: "string", example: "Corolla" },
                  color: { type: "string", example: "Preto" },
                  type: { type: "string", enum: ["CARRO", "MOTO"], example: "CARRO" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Vehicle registered successfully" }
        }
      }
    },
    "/vehicles/my-vehicles": {
      get: {
        tags: ["Vehicles"],
        summary: "Get current user registered vehicles",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of owned vehicles" }
        }
      }
    },
    "/vehicles/{id}": {
      get: {
        tags: ["Vehicles"],
        summary: "Get vehicle by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Vehicle data object" }
        }
      },
      put: {
        tags: ["Vehicles"],
        summary: "Update vehicle specs",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brand: { type: "string" },
                  model: { type: "string" },
                  color: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Vehicle updated successfully" }
        }
      },
      delete: {
        tags: ["Vehicles"],
        summary: "Remove vehicle registration",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Vehicle deleted successfully" }
        }
      }
    },

    // PROPERTIES
    "/properties": {
      get: {
        tags: ["Properties"],
        summary: "Get all properties",
        description: "Public directory listing all active properties.",
        responses: {
          200: { description: "Array of properties" }
        }
      },
      post: {
        tags: ["Properties"],
        summary: "Register a property",
        description: "Creates a property with geolocation details and image files uploaded via Cloudinary.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "cep", "street", "number", "neighborhood", "city", "state"],
                properties: {
                  name: { type: "string", example: "Condominio Jardim" },
                  cep: { type: "string", example: "12345000" },
                  street: { type: "string", example: "Rua das Flores" },
                  number: { type: "string", example: "100" },
                  complement: { type: "string" },
                  neighborhood: { type: "string", example: "Centro" },
                  city: { type: "string", example: "Sao Paulo" },
                  state: { type: "string", example: "SP" },
                  images: { type: "array", items: { type: "string", format: "binary" }, description: "Multiple image uploads" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Property created successfully" }
        }
      }
    },
    "/properties/my-properties": {
      get: {
        tags: ["Properties"],
        summary: "List owner's registered properties",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of owned properties" }
        }
      }
    },
    "/properties/{id}": {
      get: {
        tags: ["Properties"],
        summary: "Get property profile",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Detailed property profile" }
        }
      },
      put: {
        tags: ["Properties"],
        summary: "Edit property configurations",
        description: "Updates textual data, allows submitting new image uploads and specifying existing images to delete via their URLs.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  cep: { type: "string" },
                  street: { type: "string" },
                  number: { type: "string" },
                  imagesToRemove: { type: "array", items: { type: "string" }, description: "Array of image URLs to delete from Cloudinary" },
                  images: { type: "array", items: { type: "string", format: "binary" }, description: "New image uploads to append" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Property updated successfully" }
        }
      },
      delete: {
        tags: ["Properties"],
        summary: "Remove property details",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Property removed" }
        }
      }
    },

    // SPOTS (PARKING SPOTS)
    "/spots/properties/{propId}/spots": {
      get: {
        tags: ["Spots (Parking)"],
        summary: "List all spots inside a property",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "propId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Array of spots inside this property" }
        }
      },
      post: {
        tags: ["Spots (Parking)"],
        summary: "Batch generate spots",
        description: "Generates multiple identical parking spots inside a property with default weekday schedules and specifications.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "propId", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["price", "size", "allowedVehicles", "quantity", "startDate", "endDate", "startTime", "endTime", "weekdays"],
                properties: {
                  price: { type: "string", example: "20.00" },
                  size: { type: "string", example: "12.50" },
                  isCovered: { type: "boolean", default: false },
                  allowedVehicles: { type: "string", description: "JSON Array of allowed vehicle types, e.g. [\"CARRO\",\"MOTO\"]" },
                  quantity: { type: "integer", default: 1, example: 5 },
                  startDate: { type: "string", format: "date", example: "2026-01-01" },
                  endDate: { type: "string", format: "date", example: "2026-07-10" },
                  startTime: { type: "string", example: "08:00:00" },
                  endTime: { type: "string", example: "10:00:00" },
                  weekdays: { type: "integer", description: "Bitwise representation of active weekdays (e.g., 127 for all days)", example: 127 },
                  images: { type: "array", items: { type: "string", format: "binary" } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Batch spots created and awaiting admin review" }
        }
      }
    },
    "/spots/{id}/status": {
      patch: {
        tags: ["Spots (Parking)"],
        summary: "Manually toggle spot status",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["DISPONIVEL", "ALUGADA", "MANUTENCAO"], example: "DISPONIVEL" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Status adjusted successfully" }
        }
      }
    },
    "/spots/properties/{propId}/spots/{id}": {
      put: {
        tags: ["Spots (Parking)"],
        summary: "Update detailed spot configurations",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "propId", in: "path", required: true, schema: { type: "integer" } },
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  price: { type: "string" },
                  size: { type: "string" },
                  isCovered: { type: "boolean" },
                  image: { type: "string", format: "binary" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Spot configurations adjusted" }
        }
      },
      delete: {
        tags: ["Spots (Parking)"],
        summary: "Remove spot configuration",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "propId", in: "path", required: true, schema: { type: "integer" } },
          { name: "id", in: "path", required: true, schema: { type: "integer" } }
        ],
        responses: {
          200: { description: "Spot deleted successfully" }
        }
      }
    },

    // RESERVATIONS
    "/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "Get current user reservation list",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of user bookings" }
        }
      },
      post: {
        tags: ["Reservations"],
        summary: "Book a spot reservation",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["spotId", "vehicleId", "startDate", "endDate"],
                properties: {
                  spotId: { type: "integer", example: 2 },
                  vehicleId: { type: "integer", example: 1 },
                  startDate: { type: "string", format: "date", example: "2026-05-15" },
                  endDate: { type: "string", format: "date", example: "2026-05-20" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Reservation booked, pending owner's approval" }
        }
      }
    },
    "/reservations/search/address": {
      get: {
        tags: ["Reservations"],
        summary: "Find spots by geolocation address",
        description: "Uses Google Maps API integration to geocode location strings, finding surrounding approved active parking spots.",
        parameters: [
          { name: "address", in: "query", required: true, schema: { type: "string" }, example: "Avenida Paulista, Sao Paulo" },
          { name: "radius", in: "query", schema: { type: "number", default: 5 }, description: "Search radius in kilometers" }
        ],
        responses: {
          200: { description: "List of matching properties and spots" }
        }
      }
    },
    "/reservations/owner": {
      get: {
        tags: ["Reservations"],
        summary: "List booking requests sent to owner's spots",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of incoming reservation requests" }
        }
      }
    },
    "/reservations/{id}/{action}": {
      patch: {
        tags: ["Reservations"],
        summary: "Approve, Reject, or Cancel a reservation",
        description: "Applies action to reservation. Valid actions: `approve`, `reject`, `cancel`.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { name: "action", in: "path", required: true, schema: { type: "string", enum: ["approve", "reject", "cancel"] } }
        ],
        responses: {
          200: { description: "Reservation status updated successfully" }
        }
      }
    },

    // REVIEWS
    "/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List all reviews in the system (Manager/Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all reviews" }
        }
      },
      post: {
        tags: ["Reviews"],
        summary: "Create property/spot review",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reservationId", "rating", "comment"],
                properties: {
                  reservationId: { type: "integer", example: 2 },
                  rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
                  comment: { type: "string", example: "Estacionamento espaçoso e muito seguro." }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Review saved successfully" }
        }
      }
    },
    "/reviews/my": {
      get: {
        tags: ["Reviews"],
        summary: "Get current user authored reviews",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of matching reviews" }
        }
      }
    },
    "/reviews/properties/{propertyId}": {
      get: {
        tags: ["Reviews"],
        summary: "List all reviews of a property",
        parameters: [{ name: "propertyId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Array of property reviews" }
        }
      }
    },
    "/reviews/spots/{spotId}": {
      get: {
        tags: ["Reviews"],
        summary: "List all reviews of a spot",
        parameters: [{ name: "spotId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Array of spot reviews" }
        }
      }
    },
    "/reviews/{id}": {
      put: {
        tags: ["Reviews"],
        summary: "Update existing review comment",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating", "comment"],
                properties: {
                  rating: { type: "integer", example: 4 },
                  comment: { type: "string", example: "Boa vaga, mas o portão demorou a abrir." }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Review updated" }
        }
      },
      delete: {
        tags: ["Reviews"],
        summary: "Delete review record",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Review removed" }
        }
      }
    },

    // REPORTS
    "/reports": {
      post: {
        tags: ["Reports"],
        summary: "File an abuse report (complaint)",
        description: "Submit abuse complaints regarding offensive chat dialogs or unapproved spot activity. Supports attaching image proof files.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["description", "reason", "targetType", "targetId"],
                properties: {
                  description: { type: "string", example: "Linguagem altamente agressiva no chat." },
                  reason: { type: "string", example: "Linguagem ofensiva" },
                  targetType: { type: "string", enum: ["CHAT", "SPOT"], example: "CHAT" },
                  targetId: { type: "integer", example: 1, description: "ID of message or spot target" },
                  images: { type: "array", items: { type: "string", format: "binary" } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Report received, pending admin moderation" }
        }
      }
    },
    "/reports/my": {
      get: {
        tags: ["Reports"],
        summary: "Get list of filed complaints by this user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of user's filed reports" }
        }
      }
    },
    "/reports/{id}/reanalysis": {
      patch: {
        tags: ["Reports"],
        summary: "Request report reanalysis",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["description"],
                properties: {
                  description: { type: "string", example: "Por favor, revise as capturas de tela novamente." }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Report set back to PENDING for admin reevaluation" }
        }
      }
    },

    // CHATS
    "/chats": {
      get: {
        tags: ["Chats"],
        summary: "Get active chat conversation list",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of active chat threads" }
        }
      }
    },
    "/chats/block": {
      post: {
        tags: ["Chats"],
        summary: "Block user in chat",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["blockedUserId"],
                properties: {
                  blockedUserId: { type: "integer", example: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "User blocked successfully" }
        }
      }
    },
    "/chats/block/{userId}": {
      delete: {
        tags: ["Chats"],
        summary: "Unblock user in chat",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "User unblocked successfully" }
        }
      }
    },
    "/chats/{conversationId}": {
      get: {
        tags: ["Chats"],
        summary: "Get full dialogue text history",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Full thread conversation logs" }
        }
      }
    },
    "/chats/{conversationId}/search": {
      get: {
        tags: ["Chats"],
        summary: "Search messages inside conversation",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "conversationId", in: "path", required: true, schema: { type: "string" } },
          { name: "query", in: "query", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Matching text messages list" }
        }
      }
    },
    "/chats/{conversationId}/messages": {
      post: {
        tags: ["Chats"],
        summary: "Send message inside conversation",
        description: "Creates message. Supports optionally attaching single image file via upload.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  content: { type: "string", example: "Olá! Tudo bem com a reserva?" },
                  file: { type: "string", format: "binary" }
                }
              }
            }
          }
        },
        responses: {
          201: { description: "Message dispatched" }
        }
      }
    },
    "/chats/messages/{messageId}": {
      put: {
        tags: ["Chats"],
        summary: "Edit text content of a message",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "messageId", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: { type: "string", example: "Mensagem editada." }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Message updated" }
        }
      },
      delete: {
        tags: ["Chats"],
        summary: "Delete message locally",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "messageId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Message removed from thread view" }
        }
      }
    },
    "/chats/delete-multiple": {
      post: {
        tags: ["Chats"],
        summary: "Batch delete messages",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["messageIds"],
                properties: {
                  messageIds: { type: "array", items: { type: "integer" }, example: [1, 2, 3] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Selected messages removed" }
        }
      }
    },
    "/chats/{conversationId}/for-everyone": {
      delete: {
        tags: ["Chats"],
        summary: "Delete conversation thread for both users",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "conversationId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Thread purged from system" }
        }
      }
    },

    // LOCATIONS
    "/locations/states": {
      get: {
        tags: ["Locations"],
        summary: "List all Brazilian states",
        responses: {
          200: { description: "List of states" }
        }
      }
    },
    "/locations/states/{stateId}/cities": {
      get: {
        tags: ["Locations"],
        summary: "List cities by state ID",
        parameters: [{ name: "stateId", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "List of cities in the specified state" }
        }
      }
    },

    // ADMINISTRATIVE CONTROLS & DASHBOARD (ADMIN ONLY)
    "/admin/dashboard/stats": {
      get: {
        tags: ["Admin Dashboard"],
        summary: "Get overall platform metrics",
        description: "Returns general counts of users (active, blocked), total active parking spots, properties, reports, and reservations.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Statistics object" }
        }
      }
    },
    "/admin/users": {
      get: {
        tags: ["Users"],
        summary: "List all registered users (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all users" }
        }
      }
    },
    "/admin/users/blocked/count": {
      get: {
        tags: ["Users"],
        summary: "Count blocked users (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Total count number" }
        }
      }
    },
    "/admin/users/{id}": {
      put: {
        tags: ["Users"],
        summary: "Update user profile details as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  role: { type: "string", enum: ["USER", "MANAGER", "ADMIN"] },
                  isActive: { type: "boolean" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "User modified successfully" }
        }
      },
      delete: {
        tags: ["Users"],
        summary: "Force delete user account as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Account removed permanently" }
        }
      }
    },
    "/admin/users/{id}/block": {
      patch: {
        tags: ["Users"],
        summary: "Toggle block status of a user (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Block toggled successfully" }
        }
      }
    },
    "/admin/vehicles": {
      get: {
        tags: ["Vehicles"],
        summary: "List all vehicles registered on platform (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all vehicles" }
        }
      }
    },
    "/admin/vehicles/search": {
      get: {
        tags: ["Vehicles"],
        summary: "Advanced search vehicle list (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "query", schema: { type: "integer" } },
          { name: "email", in: "query", schema: { type: "string" }, description: "Search by owner email" },
          { name: "plate", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Array of matching vehicles" }
        }
      }
    },
    "/admin/vehicles/{id}": {
      get: {
        tags: ["Vehicles"],
        summary: "Get specific vehicle details as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Vehicle object" }
        }
      },
      put: {
        tags: ["Vehicles"],
        summary: "Force edit vehicle details as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  plate: { type: "string" },
                  brand: { type: "string" },
                  model: { type: "string" },
                  color: { type: "string" }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Vehicle details updated" }
        }
      },
      delete: {
        tags: ["Vehicles"],
        summary: "Force delete vehicle profile as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Vehicle record removed" }
        }
      }
    },
    "/admin/properties": {
      get: {
        tags: ["Properties"],
        summary: "List all properties in database (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all properties" }
        }
      }
    },
    "/admin/properties/search": {
      get: {
        tags: ["Properties"],
        summary: "Advanced search property directory (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "query", schema: { type: "integer" } },
          { name: "ownerName", in: "query", schema: { type: "string" }, description: "Partial or full owner name" },
          { name: "name", in: "query", schema: { type: "string" }, description: "Partial property name search" }
        ],
        responses: {
          200: { description: "Array of matching properties" }
        }
      }
    },
    "/admin/properties/{id}": {
      get: {
        tags: ["Properties"],
        summary: "Get specific property details as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Property profile object" }
        }
      },
      put: {
        tags: ["Properties"],
        summary: "Modify property configs as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  cep: { type: "string" },
                  street: { type: "string" },
                  number: { type: "string" },
                  imagesToRemove: { type: "array", items: { type: "string" } },
                  images: { type: "array", items: { type: "string", format: "binary" } }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Property altered" }
        }
      },
      delete: {
        tags: ["Properties"],
        summary: "Force purge property profile as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Property deleted" }
        }
      }
    },
    "/admin/spots": {
      get: {
        tags: ["Spots (Parking)"],
        summary: "List all parking spots in database (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all parking spots" }
        }
      }
    },
    "/admin/spots/search": {
      get: {
        tags: ["Spots (Parking)"],
        summary: "Advanced search spot list (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "query", schema: { type: "integer" } },
          { name: "email", in: "query", schema: { type: "string" }, description: "Search by owner email" },
          { name: "status", in: "query", schema: { type: "string", enum: ["DISPONIVEL", "ALUGADA", "MANUTENCAO"] } }
        ],
        responses: {
          200: { description: "Array of matching parking spots" }
        }
      }
    },
    "/admin/spots/{id}/evaluate": {
      patch: {
        tags: ["Spots (Parking)"],
        summary: "Evaluate and approve/reject spot (Admin)",
        description: "Enforces registration checks. If it is the user's first spot approval, sends SMS/Push notifications.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["APROVADA", "REJEITADA"], example: "APROVADA" },
                  rejectionReason: { type: "string", example: "Imagem desfocada." }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Evaluation submitted" }
        }
      }
    },
    "/admin/spots/{id}/active": {
      patch: {
        tags: ["Spots (Parking)"],
        summary: "Toggle active state of a spot (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Spot active status changed" }
        }
      }
    },
    "/admin/spots/{id}": {
      delete: {
        tags: ["Spots (Parking)"],
        summary: "Force delete a parking spot (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Spot record deleted" }
        }
      }
    },
    "/admin/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "List all bookings in system (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all bookings" }
        }
      }
    },
    "/admin/reservations/search": {
      get: {
        tags: ["Reservations"],
        summary: "Advanced search reservation database (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "query", schema: { type: "integer" } },
          { name: "email", in: "query", schema: { type: "string" }, description: "Search by booking user's email" },
          { name: "status", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Array of matching bookings" }
        }
      }
    },
    "/admin/reservations/{id}": {
      get: {
        tags: ["Reservations"],
        summary: "Get specific reservation detail (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Detailed booking record object" }
        }
      }
    },
    "/admin/reservations/{id}/force-cancel": {
      patch: {
        tags: ["Reservations"],
        summary: "Administratively force cancel a reservation (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Reservation status updated to CANCELADA" }
        }
      }
    },
    "/admin/reports": {
      get: {
        tags: ["Reports"],
        summary: "List all complaints/abuse reports (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all reports" }
        }
      }
    },
    "/admin/reports/search": {
      get: {
        tags: ["Reports"],
        summary: "Advanced search reports (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "query", schema: { type: "integer" } },
          { name: "email", in: "query", schema: { type: "string" }, description: "Search by reporter user email" },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDENTE", "RESOLVIDA", "REJEITADA"] } }
        ],
        responses: {
          200: { description: "Array of matching reports" }
        }
      }
    },
    "/admin/reports/{id}": {
      get: {
        tags: ["Reports"],
        summary: "Get complaint details (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Report object details" }
        }
      }
    },
    "/admin/reports/{id}/status": {
      patch: {
        tags: ["Reports"],
        summary: "Resolve and conclude report review (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["RESOLVIDA", "REJEITADA"], example: "RESOLVIDA" },
                  adminNote: { type: "string", example: "O usuário reportado foi devidamente advertido." }
                }
              }
            }
          }
        },
        responses: {
          200: { description: "Report moderated successfully" }
        }
      }
    },
    "/admin/reviews": {
      get: {
        tags: ["Reviews"],
        summary: "List all property evaluations in system (Admin)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Array of all reviews" }
        }
      }
    },
    "/admin/reviews/search": {
      get: {
        tags: ["Reviews"],
        summary: "Advanced search evaluations (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "query", schema: { type: "integer" } },
          { name: "email", in: "query", schema: { type: "string" }, description: "Search by author email" }
        ],
        responses: {
          200: { description: "Array of matching reviews" }
        }
      }
    },
    "/admin/reviews/{id}": {
      get: {
        tags: ["Reviews"],
        summary: "Get specific evaluation (Admin)",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Review detail object" }
        }
      },
      delete: {
        tags: ["Reviews"],
        summary: "Force delete a review as Admin",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          200: { description: "Review record removed permanently" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your valid stateless Access Token (JWT) to access secured endpoints."
      }
    }
  }
};

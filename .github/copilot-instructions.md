---
applyTo: "**"
--- 

## Context
This is a Node.js REST API built with:

- Express.js

- MongoDB Atlas

- Mongoose

- JavaScript (ES6+)

Project structure:

    src/
    ├── controllers/
    ├── services/
    ├── routes/
    ├── models/
    ├── middlewares/
    ├── config/
    ├── utils/
    ├── app.js
    └── server.js


All generated code must be clean, scalable, production-ready, and follow SOLID principles.

## Architecture Rules
### Controllers

Handle HTTP layer only.

No business logic.

Call services.

Use async/await.

Always use try/catch and forward errors to middleware.

### Services

Contain business logic only.

Communicate with models.

No HTTP logic.

No direct req or res usage.

### Models

Define Mongoose schemas only.

Use timestamps.

Define indexes properly.

Never contain business logic.

### Routes

Only define endpoints.

Attach middleware.

Connect controller methods.

### SOLID Compliance

    Single Responsibility: one responsibility per file.

    Open/Closed: extend behavior via services, not controller modification.

    Dependency Inversion: controllers depend on services, not models.

    No tight coupling between layers.

    Bad:

    // Controller calling model directly
    User.find()


    Good:

    const users = await userService.getAllUsers();

MongoDB & Mongoose Best Practices

Use environment variables for Mongo URI.

Never hardcode credentials.

Disable autoIndex in production.

Use .lean() for read queries.

Always paginate list endpoints.

Select only required fields.

Add indexes for frequently queried fields.

Avoid returning full documents.

Example:

`return User.find({}, 'name email')
  .lean()
  .limit(limit)
  .skip(offset);`


Use transactions only when required.

Avoid N+1 query patterns.

Use aggregation when needed.

Performance & Scalability

Stateless API design.

No in-memory storage.

Use pagination for large datasets.

Avoid blocking synchronous code.

Use compression middleware.

Design endpoints to be horizontally scalable.

### Security Requirements

Use Helmet.

Configure CORS properly.

Use rate limiting.

Hash passwords with bcrypt.

Use JWT securely.

Never expose sensitive fields (password, tokens).

Validate request body before service layer.

Sanitize user inputs.

### Error Handling

Use centralized error middleware.

Create reusable AppError class.

Do not expose stack traces in production.

Return consistent error responses.

### API Response Format

 ```
    Success:

    {
      "success": true,
      "data": {},
      "message": "Operation successful"
    }


    Error:

    {
      "success": false,
      "message": "Error message"
    } 
``` 

Code Standards

Use async/await.

Prefer const over let.

Avoid nested callbacks.

No duplicated logic.

Keep files small and focused.

Use clear naming conventions.

Follow REST conventions.

## Copilot Behavior Instructions when generating code:

Respect services/controllers/routes/models separation.

Never put business logic in controllers.

Always optimize Mongo queries.

Always consider scalability.

Always implement validation.

Avoid anti-patterns.

Write production-ready code only.

Keep code clean and modular.

Think long-term maintainability.

Respect SOLID at all times.

## Anti-Patterns to Avoid
- Fat controllers
- Direct model usage in routes
- Hardcoded secrets
- Missing validation
- No pagination
- Returning entire documents
- Mixing responsibilities
- Monolithic files

## Goal:
Generate clean, optimized, scalable, and maintainable backend code for an Express + MongoDB Atlas application using JavaScript and respecting SOLID principles.
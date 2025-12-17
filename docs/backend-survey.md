# Backend Survey — Current Status (auto-generated)

Generated: 2025-12-17

## Summary

- The NestJS backend has a clear modular structure and basic infra wiring (Config, TypeORM, Bull, Schedule, Swagger).
- Core event system (Kafka producer + a basic consumer) and the Tasks module are the most complete features.
- Many modules are scaffolded (module files and entities present) but several controllers/services/gateways are missing or are placeholders.

## What's implemented (found in code)

- App bootstrap and global config: [backend/src/main.ts](backend/src/main.ts), [backend/src/app.module.ts](backend/src/app.module.ts) (ConfigModule, TypeOrm, Bull, Schedule, Swagger).
- Events: [backend/src/modules/events/events.service.ts](backend/src/modules/events/events.service.ts) (Kafka producer) and [backend/src/modules/events/events.consumer.ts](backend/src/modules/events/events.consumer.ts) (example consumer with basic handlers).
- Tasks: full implementation including [backend/src/modules/tasks/task.entity.ts](backend/src/modules/tasks/task.entity.ts), [backend/src/modules/tasks/tasks.controller.ts](backend/src/modules/tasks/tasks.controller.ts), [backend/src/modules/tasks/tasks.service.ts](backend/src/modules/tasks/tasks.service.ts), and DTOs ([backend/src/modules/tasks/dto/index.ts](backend/src/modules/tasks/dto/index.ts)).
- Data models (TypeORM entities) for core tables: [backend/src/modules/users/user.entity.ts](backend/src/modules/users/user.entity.ts), [backend/src/modules/families/family.entity.ts](backend/src/modules/families/family.entity.ts), [backend/src/modules/tasks/task.entity.ts](backend/src/modules/tasks/task.entity.ts), [backend/src/modules/submissions/submission.entity.ts](backend/src/modules/submissions/submission.entity.ts).
- Auth scaffolding: [backend/src/modules/auth/auth.module.ts](backend/src/modules/auth/auth.module.ts), guards ([backend/src/modules/auth/guards/jwt-auth.guard.ts](backend/src/modules/auth/guards/jwt-auth.guard.ts), [backend/src/modules/auth/guards/roles.guard.ts](backend/src/modules/auth/guards/roles.guard.ts)) and `roles` decorator. JWT module registration configured.
- Websocket, Notifications, Upload, Analytics, Submissions, Users, Families modules are declared in [backend/src/app.module.ts](backend/src/app.module.ts) and have module files present.

## Partially implemented / placeholders

- Events consumer handlers currently only log events (no delivery logic to ClickHouse, Redis, or notification services).
- Auth: JWT registration present but `JwtStrategy`, `AuthService`, and `AuthController` are missing (no full Keycloak/OAuth flow integration discovered).
- Users: `users.module.ts` and `user.entity.ts` present, but `users.service.ts` and `users.controller.ts` are not in the repo.
- Submissions: `submission.entity.ts` and `submissions.module.ts` exist but no `submissions.service.ts` or `submissions.controller.ts` were found.
- Notifications: only `notifications.module.ts` exists; implementation files (service, controller, email adapter) are missing.
- Upload: module exists but `upload.controller.ts` / `upload.service.ts` missing.
- WebSocket: `websocket.module.ts` exists but gateway implementation file not found.
- Analytics: module declared but controller/service implementations are missing.
- Families: module and entity exist, but controller/service implementations are missing.

## Not present / missing features compared to docs

- Keycloak OAuth2 flow and full auth endpoints (`/auth/login`, `/auth/callback`, token refresh) are not implemented.
- API endpoints for users, submissions, notifications, upload, analytics, and families largely missing.
- WebSocket gateway logic and client subscription handling not present.
- Upload adapter (S3 / CDN handling) is missing.
- Analytics consumer writing to ClickHouse (or other analytics sink) is missing.
- Notification delivery (email, push, websocket broadcast) is not implemented; event handlers are placeholders.
- Scheduled cron jobs for deadline reminders and streak calculations are not implemented (ScheduleModule is enabled but no scheduled jobs found).
- Bull queue processors and jobs are not implemented despite BullModule configured.
- Rate-limiting, request throttling, and more advanced observability integrations (traces/exporters) not present.
- Tests, seeders, and integration tests were not found.

## Risks & Notes

- Several modules declare controllers/services in their module decorators but the corresponding files are missing — this will cause runtime boot failures unless those imports are removed or the files are added.
- Kafka producer is implemented; however, consumer logic is minimal and may need robust error handling, idempotency, and DLQ support.
- Auth guards are present and used by `tasks.controller.ts`. Without a working `JwtStrategy` and `AuthService` the guards will fail at runtime.

## Recommended next steps (prioritized)

1. Implement auth core:
   - Add `JwtStrategy`, `AuthService`, `AuthController` and/or Keycloak OAuth2 integration.
   - Provide env docs for `JWT_SECRET`, `JWT_EXPIRES_IN`, and Keycloak client settings.

2. Complete essential CRUD endpoints:
   - `users.service.ts` / `users.controller.ts` (users/me, patch profile, get by id)
   - `submissions.service.ts` / `submissions.controller.ts`
   - `families.service.ts` / `families.controller.ts`

3. Implement Upload service (S3/local) and `upload.controller.ts`.

4. Implement Notifications: worker/service to consume events and deliver via email / websocket.

5. Flesh out Events consumer handlers to update analytics (ClickHouse), Redis stats, and trigger notifications; add idempotency and DLQ.

6. Add WebSocket gateway implementation and integrate with EventsService for real-time pushes.

7. Add scheduled jobs for reminders and streaks (cron tasks) and implement Bull queue processors where heavy work is needed.

8. Add integration tests and basic CI checks. Add sample `.env.example` and seed scripts for local/dev.

## Quick checklist for maintainers

- [ ] Restore/add missing controllers/services referenced by modules.
- [ ] Verify `JwtStrategy` and Keycloak integration (or local JWT flow) and test protected endpoints.
- [ ] Implement upload (multipart + CDN) and secure file URLs.
- [ ] Implement notification consumer and integrate email provider.
- [ ] Add robust Kafka consumer processing (DLQ, retries, metrics).
- [ ] Add tests and CI workflows.

---

If you want, I can:

- open PRs scaffolding the missing controllers/services (one per module), or
- implement the full `Auth` flow (Keycloak + JWT) next, or
- generate minimal stub implementations so the app boots successfully for local development.

Which next step do you prefer?

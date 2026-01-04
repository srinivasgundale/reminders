# Feature: Smart Nudge Engine

## 1. Overview
The Smart Nudge Engine analyzes user logs to automatically create context-aware reminders. This reduces the cognitive load of setting manual reminders for recurring maintenance tasks.

## 2. Architecture
- **Domain**: `src/domain/nudge-logic.ts` contains the pure-function rules engine.
- **Service**: `AppService` calls the engine during `logEvent` execution.
- **Data**: Reminders are linked to `LifeLog` via `linkedLogId` for traceability.

## 3. Implementation Logic
Current Rules:
1. **Renewal Detection**: Keywords "renew", "insurance", "annual" -> Create reminder 1 year later (minus 7 days).
2. **Standard Maintenance**: Keywords "service", "oil change", "dentist" -> Create reminder 6 months later.
3. **Short-term Checks**: Keywords "filter", "clean" -> Create reminder 3 months later.

## 4. Test Cases
- [x] Log "Car Insurance" -> Auto-creates "Renew: Car Insurance" for next year.
- [x] Log "Dentist Visit" -> Auto-creates "Due: Dentist Visit" for 6 months later.
- [x] Log "AC Filter" -> Auto-creates "Check: AC Filter" for 3 months later.

## 5. Future Improvements
- [ ] User-defined rules (custom keywords).
- [ ] Machine Learning based on historic frequency (e.g., if user Logs "Haircut" every 25 days, suggest 25 days).

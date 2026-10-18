# MongoDB Schema & Database Architecture

Smart Finance Tracker is built on MongoDB using **Django 5.2** and **`django-mongodb-backend`** (backed by **PyMongo 4.19**). Each Django model is persisted as an independent MongoDB collection with native BSON `ObjectId` primary keys and query-optimized compound indexes.

Django relationships (foreign keys) are maintained as references rather than embedded subdocuments. This prevents document size limits (MongoDB 16 MB limit) and maintains high performance as transactions, conversation logs, and notifications scale.

---

## 📚 Complete Collections Overview (26 Collections)

The database `smart_finance_tracker` comprises **26 collections** divided into core business domains and Django system tables:

### 1. User & Accounts (Domain)
| Collection | Model Class | Description & Key Fields | Indexes |
| :--- | :--- | :--- | :--- |
| `users` | `accounts.User` | Custom user model with currency preferences, profile settings, and auth flags. | `_id`, `username`, `email` |
| `accounts` | `accounts.Account` | Financial accounts (checking, savings, credit cards, investments). Tracks balances across currencies. | `_id`, `(user, is_active)`, `(user, account_type)` |

### 2. Core Financial Tracking (Domain)
| Collection | Model Class | Description & Key Fields | Indexes |
| :--- | :--- | :--- | :--- |
| `categories` | `transactions.Category` | Pre-seeded & custom income/expense categories with icons, colors, and system flags. | `_id`, `(category_type, name)`, `(is_system, category_type)` |
| `transactions` | `transactions.Transaction` | Income and expense records with amount, date, optional receipt attachment, and account link. | `_id`, `(user, date)`, `(account, date)`, `(category, date)`, `(user, transaction_type, date)` |
| `budgets` | `budgets.Budget` | Spending limits per category across flexible periods (monthly, weekly, yearly) with alert thresholds. | `_id`, `(user, period)`, `(user, is_active)`, `(user, category, start_date)` |

### 3. Bills & Payments (Domain)
| Collection | Model Class | Description & Key Fields | Indexes |
| :--- | :--- | :--- | :--- |
| `bills` | `bills.Bill` | Recurring and one-time bills, auto-pay flags, frequencies, and next due date calculations. | `_id`, `(user, status)`, `(user, is_active)`, `(user, next_due_date)` |
| `bill_payments` | `bills.BillPayment` | Audit trail of bill payments with paid amount, date, and transaction reference. | `_id`, `bill`, `payment_date` |
| `bill_notifications` | `bills.BillNotification` | Tracking state of reminders and alerts dispatched before bill due dates. | `_id`, `(user, is_read)`, `(bill, notification_type)` |

### 4. Savings Goals (Domain)
| Collection | Model Class | Description & Key Fields | Indexes |
| :--- | :--- | :--- | :--- |
| `savings_goals` | `goals.SavingsGoal` | Financial targets (emergency fund, travel, vehicle) with target dates and target amounts. | `_id`, `(user, status)`, `(user, priority)`, `(user, target_date)` |
| `goal_contributions` | `goals.GoalContribution` | Historical log of deposits and contributions applied towards a savings goal. | `_id`, `goal`, `date` |
| `goal_milestones` | `goals.GoalMilestone` | Checkpoint milestones (e.g. 25%, 50%, 75%) reached towards savings goals. | `_id`, `goal`, `target_percentage` |

### 5. AI Chatbot Agent (Domain)
| Collection | Model Class | Description & Key Fields | Indexes |
| :--- | :--- | :--- | :--- |
| `chatbot_chatsession` | `chatbot.ChatSession` | Multi-turn chat conversation threads per user with session metadata. | `_id`, `(user, is_active)`, `created_at` |
| `chatbot_chatmessage` | `chatbot.ChatMessage` | Incoming user queries and assistant AI responses with token metadata. | `_id`, `session`, `timestamp` |
| `chatbot_chataction` | `chatbot.ChatAction` | Dynamic tool invocations dispatched by the AI (e.g. `create_budget`, `create_goal`). | `_id`, `session`, `status` |
| `chatbot_chatinsight` | `chatbot.ChatInsight` | Proactive spending summaries and actionable financial tips generated for the user. | `_id`, `(user, is_read)`, `created_at` |

### 6. Machine Learning (Domain)
| Collection | Model Class | Description & Key Fields | Indexes |
| :--- | :--- | :--- | :--- |
| `ml_models` | `ml_features.MLModel` | Metadata, hyperparameters, and accuracy scores of trained categorization & budget models. | `_id`, `model_type`, `version` |
| `prediction_logs` | `ml_features.PredictionLog` | Historical inference logs capturing raw text input, predicted categories, and confidence scores. | `_id`, `(user, created_at)`, `(model, confidence)` |

### 7. Django Framework System Collections
| Collection | Purpose | Indexes |
| :--- | :--- | :--- |
| `django_migrations` | Migration execution history and schema version control. | `_id` |
| `django_content_type` | Content type registry mapping models for Django admin & permissions. | `_id`, `(app_label, model)` |
| `django_session` | Session state storage for authenticated browser sessions. | `_id`, `expire_date` |
| `django_admin_log` | Audit logs for administrative actions taken in `/admin/`. | `_id`, `(user, action_time)` |
| `auth_permission` | Granular permission definitions per model. | `_id`, `(content_type, codename)` |
| `auth_group` | Role-based permission groups. | `_id`, `name` |
| `auth_group_permissions`| Group-to-permission mapping references. | `_id`, `(group, permission)` |
| `users_groups` | User-to-group membership mapping references. | `_id`, `(user, group)` |
| `users_user_permissions`| User-specific custom permission overrides. | `_id`, `(user, permission)` |

---

## ⚙️ Data Types & BSON Storage Rules

- **Primary Keys**: Native BSON `ObjectId` via `DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"`.
- **Monetary Amounts**: Stored as high-precision MongoDB `Decimal128` through Django's `DecimalField` (e.g. `amount = models.DecimalField(max_digits=12, decimal_places=2)`). This prevents floating-point rounding errors in financial transactions.
- **Dates & Timestamps**: Native BSON `Date` objects mapped via Django `DateField` and `DateTimeField` in UTC.
- **Embedded Documents**: Structured JSON fields (`parameters`, `result`, `metadata`, `input_data`, `prediction`) are stored as embedded BSON subdocuments.
- **File & Media Storage**: Uploaded receipt images remain stored on disk under `MEDIA_ROOT`; only the relative file path string is persisted in MongoDB.

---

## 🔌 Connection & Configuration

Database settings are configured in `finance_tracker/settings.py` via `django_mongodb_backend`:

```python
DATABASES = {
    "default": {
        "ENGINE": "django_mongodb_backend",
        "NAME": os.environ.get("MONGODB_NAME", "smart_finance_tracker"),
        "HOST": os.environ.get("MONGODB_URI", "mongodb://localhost:27017"),
        "OPTIONS": {
            "serverSelectionTimeoutMS": int(
                os.environ.get("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "15000")
            ),
            "connectTimeoutMS": int(
                os.environ.get("MONGODB_CONNECT_TIMEOUT_MS", "15000")
            ),
        },
    }
}
```

> **Note**: `django-mongodb-backend` reads the MongoDB connection string from the **`HOST`** key.

### Environment Variables (`.env`)

```bash
# For MongoDB Atlas (Recommended):
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smart_finance_tracker?retryWrites=true&w=majority"
MONGODB_NAME="smart_finance_tracker"

# For Local MongoDB:
# MONGODB_URI="mongodb://localhost:27017"
# MONGODB_NAME="smart_finance_tracker"

MONGODB_SERVER_SELECTION_TIMEOUT_MS="15000"
MONGODB_CONNECT_TIMEOUT_MS="15000"
```

---

## 🚀 Initializing & Applying the Schema

Execute the following commands to initialize the database and collections:

```bash
# 1. Apply all migrations and construct MongoDB collections + indexes
python manage.py migrate

# 2. Seed default categories (23 system categories for income & expenses)
python manage.py populate_categories

# 3. Create administrator credentials
python manage.py createsuperuser

# 4. Verify system and database connectivity
python test_system.py
```

---

## 🛠️ MongoDB Atlas Troubleshooting Guide

1. **IP Whitelist (Network Access)**: In MongoDB Atlas under **Network Access**, ensure your current public IP (or `0.0.0.0/0` for development) is added to the IP Access List.
2. **Database User Privileges**: Under **Database Access**, ensure the database user has `readWriteAnyDatabase` or `dbOwner` privileges on the `smart_finance_tracker` database.
3. **Connection String Escaping**: If your database password contains special characters (e.g. `@`, `:`, `/`, `%`), ensure they are properly URL-encoded in `MONGODB_URI`.
4. **Timeouts**: If connecting over high-latency networks, keep `MONGODB_SERVER_SELECTION_TIMEOUT_MS` and `MONGODB_CONNECT_TIMEOUT_MS` set to `15000` (15 seconds).

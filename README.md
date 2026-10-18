# Smart Finance Tracker

An advanced, AI-powered Django finance tracker with multi-account support, intelligent chatbot agent, machine learning features, bill tracking, savings goals, and comprehensive REST APIs.

## Overview

Smart Finance Tracker is a comprehensive Django-based personal finance management system empowering users to take complete control of their financial life. The application combines powerful backend APIs, machine learning capabilities, and an intelligent AI chatbot agent to provide a holistic financial management experience.

### Key Capabilities

- **Multi-Account Management**: Track multiple financial accounts (checking, savings, credit cards, cash, investments)
- **Income & Expense Tracking**: Log and categorize all financial transactions automatically
- **Budget Management**: Set, monitor, and receive intelligent alerts for budgets
- **Bills Tracking**: Manage recurring and one-time bills with notifications
- **Savings Goals**: Set and track financial goals with progress monitoring
- **AI-Powered Chatbot**: Conversational financial assistant using LLM (Gemini/Ollama)
- **RESTful API**: Full Django REST Framework API for third-party integrations
- **Machine Learning Features**:
  - Automatic transaction categorization using NLP
  - Predictive budgeting based on historical spending patterns
  - Intelligent spending analysis
- **Real-time Financial Insights**: Visualize spending patterns, trends, and financial health

## Features

### 1. User & Account Management

- **Secure Authentication**: Session and token-based authentication
- **Custom User Model**: Extended user profiles with preferences
- **Multi-Account Support**: Managing multiple account types (checking, savings, credit card, cash, investment, other)
- **Real-time Balance Tracking**: Accurate account balances across currencies
- **Multi-Currency Support**: Handle transactions in different currencies
- **Account Activation/Deactivation**: Easy account management

### 2. Transaction Management

- **Income & Expense Tracking**: Log all financial transactions
- **23 Default Categories**: Pre-configured categories (7 income, 16 expense including salary, groceries, rent, utilities, etc.)
- **Auto-Categorization**: ML-powered automatic transaction categorization
- **Advanced Filtering**: Search by date, category, amount, account
- **Receipt Management**: Upload and store receipt images
- **Recurring Transactions**: Support for recurring transaction patterns
- **Transaction Summaries**: Weekly, monthly, yearly summaries

### 3. Budget Management

- **Category-Based Budgets**: Set spending limits by category
- **Flexible Periods**: Daily, weekly, monthly, yearly budget periods
- **Real-time Tracking**: Monitor spending against budget in real-time
- **Smart Alerts**: Customizable threshold-based notifications
- **Predictive Budgeting**: ML-powered budget recommendations
- **Budget History**: Track budget adjustments and performance over time

### 4. Bills Management

- **Recurring Bills**: Track monthly, quarterly, yearly bills
- **One-Time Bills**: Manage one-time payments
- **Due Date Tracking**: Never miss a due date with reminders
- **Auto-Pay Support**: Optional automatic payment from account
- **Bill Frequency**: Weekly, bi-weekly, monthly, quarterly, yearly options
- **Notification Settings**: Customizable alerts (3 days before, etc.)
- **Status Tracking**: Pending, paid, overdue, cancelled status
- **Account Integration**: Link bills to specific accounts

### 5. Savings Goals

- **Goal Categories**: Emergency fund, vacation, car, home, education, retirement, etc.
- **Progress Tracking**: Monitor progress toward financial goals
- **Priority Levels**: Set priority (low, medium, high) for goals
- **Target Dates**: Set realistic timelines for goals
- **Current Amount Tracking**: Track contributions and progress
- **Goal Status**: Active/completed status management
- **Smart Suggestions**: Recommendations based on spending patterns

### 6. AI-Powered Financial Chatbot

- **LLM Integration**:
  - **Google Gemini API**: Advanced, cloud-based LLM (default)
  - **Ollama**: Local, open-source LLM alternative
- **Intelligent Agent**: Dynamic tool calling and decision making
- **Conversation Management**: Multiple chat sessions per user
- **Financial Context Awareness**: Understands user's financial situation
- **Chatbot Capabilities**:
  - Create and manage savings goals
  - Create and modify budgets
  - Analyze spending patterns
  - Provide financial insights
  - Answer financial questions
  - Track account balances
  - Generate spending reports
  - Get personalized recommendations

### 7. Machine Learning Features

#### Automatic Transaction Categorization

- **Algorithm**: TF-IDF vectorization + Multinomial Naive Bayes
- **Learning**: Continuously learns from user-categorized transactions
- **Confidence Scoring**: Only applies predictions with >60% confidence
- **Accuracy Improvement**: Improves with more user data
- **Real-Time Suggestions**: Suggests categories as users add transactions

#### Predictive Budgeting

- **Analysis Period**: Examines last 90 days of spending
- **Pattern Recognition**: Identifies spending trends and habits

## Tech Stack

### Backend & Framework

- **Django**: 4.2+ - Powerful Python web framework
- **Django REST Framework**: 3.14+ - RESTful API toolkit
- **Python**: 3.8+

### Database

- **SQLite**: Development database
- **PostgreSQL**: Production-ready database (configurable)

### Machine Learning

- **scikit-learn**: Classification and ML algorithms
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **joblib**: Model persistence

### AI/LLM Integration

- **Google Generative AI**: Gemini API for cloud-based LLM
- **Requests**: HTTP library for Ollama integration
- **Ollama**: Optional local LLM support

### Image & Data Handling

- **Pillow**: Image processing for receipt uploads
- **JSON**: Built-in Django JSON field support

### Utilities

- **django-cors-headers**: CORS handling for API
- **python-dateutil**: Date utilities

### Frontend (Optional)

- **Vite & React**: Fast, responsive single-page web frontend (included in `frontend/`)
- **Node.js**: JavaScript runtime for building and serving the React UI
- **Tailwind CSS & Lucide Icons**: Modern UI component styling

## Prerequisites

- **Python**: 3.10 or higher
- **MongoDB**: MongoDB Atlas cluster (recommended) or local MongoDB instance (v4.4+)
- **pip**: Python package manager
- **Node.js & npm**: (v18+) For the React frontend
- **virtualenv** or **conda**: Virtual environment manager (recommended)
- **Git**: For cloning the repository
- **Google Gemini API Key** (optional): For conversational AI chatbot feature
- **Ollama** (optional): For local, offline LLM support

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/AnuragBaibhav/Smart_Finance_Tracker.git
cd smart-finance-tracker
```

### Step 2: Create and Activate Virtual Environment

#### Using venv (Recommended)

```bash
# Create virtual environment
python -m venv .venv

# Activate on Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate on Linux/Mac
source .venv/bin/activate
```

#### Using conda (Alternative)

```bash
conda create -n finance_tracker python=3.11
conda activate finance_tracker
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Copy `.env.example` to `.env` in the project root:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / Mac
cp .env.example .env
```

Configure your MongoDB and API keys in `.env`:

```env
# Core Django settings
DJANGO_SECRET_KEY="your-secret-key-here-min-50-chars"
DEBUG="True"
ALLOWED_HOSTS="localhost,127.0.0.1"

# MongoDB Configuration (Atlas or Local)
# For MongoDB Atlas (Recommended):
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/smart_finance_tracker?retryWrites=true&w=majority"
MONGODB_NAME="smart_finance_tracker"
MONGODB_SERVER_SELECTION_TIMEOUT_MS="15000"
MONGODB_CONNECT_TIMEOUT_MS="15000"

# For Local MongoDB (Alternative):
# MONGODB_URI="mongodb://localhost:27017"
# MONGODB_NAME="smart_finance_tracker"

# Gemini LLM Configuration (AI Chatbot)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_ENABLED="True"
GEMINI_TEMPERATURE="0.7"

# Ollama LLM Configuration (Local Fallback)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="mistral"
OLLAMA_TIMEOUT="120"
OLLAMA_ENABLED="False"
```

### Step 5: Run Database Migrations (Creates MongoDB Collections)

```bash
python manage.py migrate
```

> **Note**: Django connects to MongoDB Atlas using `django-mongodb-backend`. This automatically creates the **26 MongoDB collections** with native BSON `ObjectId` keys and query indexes.

### Step 6: Populate Default Categories

```bash
python manage.py populate_categories
```

This seeds 23 standard transaction categories (7 income, 16 expense) with predefined icons and color codes.

### Step 7: Create a Superuser

```bash
python manage.py createsuperuser
```

*(Default demo credentials: `username: admin`, `password: admin123`)*

### Step 8: Verify System & Database Connectivity

Run the automated system verification script to test MongoDB models, accounts, transactions, and ML modules:

```bash
python test_system.py
```

### Step 9: Run Backend & Frontend Servers

#### Start Django Backend API:

```bash
python manage.py runserver
```

- Admin panel: http://127.0.0.1:8000/admin/
- API root: http://127.0.0.1:8000/api/

#### Start React Frontend:

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

- Frontend App: http://localhost:3000

---

## 🗄️ MongoDB Database Architecture & Collections

The database `smart_finance_tracker` is organized into **26 collections**:

| Domain | Collections | Description |
| :--- | :--- | :--- |
| **User & Accounts** | `users`, `accounts` | User preferences, authentication, financial account balances across currencies |
| **Core Financials** | `categories`, `transactions`, `budgets` | Pre-seeded categories, income/expense records with receipts, category spending limits |
| **Bills & Reminders** | `bills`, `bill_payments`, `bill_notifications` | Recurring bills, payment history audit logs, upcoming payment alerts |
| **Savings Goals** | `savings_goals`, `goal_contributions`, `goal_milestones` | Long-term target tracking, deposits, percentage completion milestones |
| **AI Chatbot** | `chatbot_chatsession`, `chatbot_chatmessage`, `chatbot_chataction`, `chatbot_chatinsight` | Multi-turn chat sessions, AI tools execution, proactive financial insights |
| **Machine Learning** | `ml_models`, `prediction_logs` | TF-IDF + Naive Bayes categorization, budget predictor model metadata and logs |
| **Django Framework** | `django_migrations`, `django_content_type`, `django_session`, `django_admin_log`, `auth_*`, `users_*` | Schema migrations tracking, session storage, admin logs, role-based permissions |

For complete schema details and index specifications, see [md/MONGODB_SCHEMA.md](md/MONGODB_SCHEMA.md).

## Chatbot Integration

The Smart Finance Tracker includes an advanced AI chatbot agent that helps users manage their finances conversationally.

### Supported LLM Providers

**1. Google Gemini (Recommended)**

- Cloud-based with latest models
- No local infrastructure needed
- Better performance and features
- Free tier available
- Set up with: `GEMINI_API_KEY` and `GEMINI_ENABLED=true`

**2. Ollama (Local Alternative)**

- Privacy-first, all data stays local
- No API key required
- Works offline
- Lower latency for repeated queries
- Models: Mistral, Llama 2, Neural Chat, etc.
- Set up with: `OLLAMA_ENABLED=true`
- Make sure to install and pull the model:
  ```bash
  ollama pull mistral  # or llama2, neural-chat, etc.
  ```

## Usage Examples

### 1. Creating an Account via API

```python
import requests

headers = {'Authorization': 'Token YOUR_API_TOKEN'}
data = {
    'name': 'My Checking Account',
    'account_type': 'checking',
    'balance': '5000.00',
    'currency': 'USD'
}

response = requests.post(
    'http://localhost:8000/api/accounts/accounts/',
    json=data,
    headers=headers
)
```

### 2. Chatbot Conversation

```python
from chatbot.agents.ai_agent import AIFinancialAgent

# Initialize agent with user ID
agent = AIFinancialAgent(user_id=1)

# Send message
result = agent.process_message("Show me my spending this month")
print(result['response'])

# Create goal via chatbot
result = agent.process_message("I want to save 10000 for a vacation")
print(result['response'])
```

### 3. Using ML Categorization

```python
from ml_features.ml_utils import get_categorizer

categorizer = get_categorizer()

# Get category suggestions
suggestions = categorizer.predict(
    description="Coffee at Starbucks",
    confidence_threshold=0.6
)
print(suggestions)  # Returns: [{'category': 'dining', 'confidence': 0.85}]
```

### 4. Budget Management Prediction

```python
from ml_features.ml_utils import BudgetPredictor

predictor = BudgetPredictor()
recommendations = predictor.suggest_budgets(user_id=1, period='monthly')
# Returns: {'groceries': 600, 'dining': 300, 'utilities': 200, ...}
```

## API Documentation

### Authentication

All API endpoints require authentication. Use session authentication for browser-based access or token authentication for programmatic access.

### Endpoints

#### Accounts

- `GET /api/accounts/users/` - List all users
- `GET /api/accounts/users/me/` - Get current user
- `GET /api/accounts/accounts/` - List user's accounts
- `POST /api/accounts/accounts/` - Create new account
- `GET /api/accounts/accounts/{id}/` - Get account details
- `PUT /api/accounts/accounts/{id}/` - Update account
- `DELETE /api/accounts/accounts/{id}/` - Delete account

#### Transactions

- `GET /api/transactions/categories/` - List all categories
- `GET /api/transactions/categories/income/` - List income categories
- `GET /api/transactions/categories/expense/` - List expense categories
- `POST /api/transactions/categories/` - Create category
- `GET /api/transactions/transactions/` - List transactions (Query params: `type`, `start_date`, `end_date`, `category`, `account`)
- `POST /api/transactions/transactions/` - Create transaction
- `GET /api/transactions/transactions/summary/` - Get transaction summary
- `GET /api/transactions/transactions/by_category/` - Group by category

#### Budgets

- `GET /api/budgets/budgets/` - List budgets
- `POST /api/budgets/budgets/` - Create budget
- `GET /api/budgets/budgets/{id}/` - Get budget details
- `PUT /api/budgets/budgets/{id}/` - Update budget
- `DELETE /api/budgets/budgets/{id}/` - Delete budget
- `GET /api/budgets/budgets/active/` - List active budgets
- `GET /api/budgets/budgets/alerts/` - Get budget alerts

#### Bills

- `GET /api/bills/bills/` - List all bills
- `POST /api/bills/bills/` - Create bill
- `GET /api/bills/bills/{id}/` - Get bill details
- `PUT /api/bills/bills/{id}/` - Update bill
- `DELETE /api/bills/bills/{id}/` - Delete bill
- `GET /api/bills/bills/upcoming/` - Get upcoming bills
- `GET /api/bills/bills/{id}/pay/` - Mark bill as paid

#### Goals

- `GET /api/goals/goals/` - List savings goals
- `POST /api/goals/goals/` - Create goal
- `GET /api/goals/goals/{id}/` - Get goal details
- `PUT /api/goals/goals/{id}/` - Update goal
- `DELETE /api/goals/goals/{id}/` - Delete goal

### Curl API Examples

#### 1. Create a Transaction

```bash
curl -X POST http://127.0.0.1:8000/api/transactions/transactions/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "account": 1,
    "category": 5,
    "transaction_type": "expense",
    "amount": "50.00",
    "description": "Grocery shopping",
    "date": "2024-05-14"
  }'
```

#### 2. Get Transaction Summary

```bash
curl http://127.0.0.1:8000/api/transactions/transactions/summary/ \
  -H "Authorization: Token YOUR_TOKEN"
```

#### 3. Create a Savings Goal

```bash
curl -X POST http://127.0.0.1:8000/api/goals/goals/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "name": "Vacation Fund",
    "description": "Summer vacation",
    "category": "vacation",
    "target_amount": "5000.00",
    "target_date": "2024-08-31",
    "priority": "high"
  }'
```

#### 4. Create a Budget

```bash
curl -X POST http://127.0.0.1:8000/api/budgets/budgets/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "category": 5,
    "limit_amount": "500.00",
    "period": "monthly",
    "alert_threshold": 80
  }'
```

#### 5. Send Message to Chatbot

```bash
curl -X POST http://127.0.0.1:8000/api/chatbot/sessions/1/send_message/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "message": "Show me my spending this month"
  }'
```

#### 6. Create a Bill

```bash
curl -X POST http://127.0.0.1:8000/api/bills/bills/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token YOUR_TOKEN" \
  -d '{
    "name": "Electric Bill",
    "amount": "120.00",
    "frequency": "monthly",
    "due_date": 15,
    "category": 8
  }'
```

## Project Structure

```text
smart-finance-tracker/
├── accounts/              # User and account management
│   ├── models.py          # User and Account models
│   ├── serializers.py     # API serializers
│   ├── views.py           # API viewsets
│   ├── urls.py            # URL routing
│   ├── admin.py           # Admin configuration
│   └── currency_utils.py  # Currency conversion utilities
├── transactions/          # Transaction management
│   ├── models.py          # Category and Transaction models
│   ├── serializers.py     # API serializers
│   ├── views.py           # API viewsets
│   ├── urls.py            # URL routing
│   ├── signals.py         # Django signals
│   └── management/        # Custom management commands
├── budgets/               # Budget management
│   ├── models.py          # Budget model
│   ├── serializers.py     # API serializers
│   ├── views.py           # API viewsets
│   └── urls.py            # URL routing
├── bills/                 # Bills management
├── goals/                 # Savings goals management
├── chatbot/               # AI chatbot agent
│   ├── agents/            # Agent logic
│   │   └── ai_agent.py    # Financial chatbot agent
│   ├── llm/               # LLM integrations
│   │   ├── gemini_client.py # Google Gemini API client
│   │   └── ollama_client.py # Ollama local LLM client
│   └── tools/             # Chatbot tools
├── ml_features/           # Machine learning features
│   ├── models.py          # ML model metadata
│   ├── ml_utils.py        # ML utilities and algorithms
│   └── views.py           # API viewsets
├── finance_tracker/       # Project configuration
│   ├── settings.py        # Django settings
│   ├── urls.py            # URL routing
│   └── wsgi.py            # WSGI configuration
├── frontend/              # Frontend application (React/Vue/Vite)
├── md/                    # Documentation
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

## Development Guide

### Adding a New Category

```python
from transactions.models import Category

Category.objects.create(
    name='Travel',
    category_type='expense',
    icon='✈️',
    color='#3498db'
)
```

### Creating Custom Management Commands

```bash
# Create command structure
python manage.py startapp mycommand
mkdir -p mycommand/management/commands
touch mycommand/management/commands/mycustom.py
```

### Debugging

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
```

### Testing

#### Run All Tests

```bash
python manage.py test
```

#### Run Specific App Tests

```bash
python manage.py test transactions
python manage.py test chatbot
python manage.py test ml_features
```

#### Test Chatbot Flow

```bash
python test_chatbot_flow.py
```

#### Test System Integration

```bash
python test_system.py
```

### Training ML Models

The ML models train automatically as data is added. To manually retrain:

```bash
python manage.py train_models --category=categorization
python manage.py train_models --category=budget_prediction
```

Or via code:

```python
from ml_features.ml_utils import get_categorizer
from transactions.models import Transaction

categorizer = get_categorizer()
transactions = Transaction.objects.filter(category__isnull=False)
descriptions = [t.description for t in transactions]
categories = [t.category.name for t in transactions]
categorizer.train(descriptions, categories)
categorizer.save_model('ml_models/categorizer.pkl')
```

## Performance Optimization

### Database Optimization

- Use `select_related()` and `prefetch_related()` for queries
- Add database indexes for frequently queried fields
- Use pagination for large result sets

### ML Model Optimization

- Cache predictions for identical descriptions
- Batch process transactions
- Archive old training data periodically

### API Optimization

- Enable caching with Redis
- Use pagination (default: 20 items per page)
- Compress API responses

## Troubleshooting

### Common Issues

**Issue**: Gemini API not working

- **Solution**: Check API key in environment variables
- **Debug**: Run `python manage.py shell` and test connection

**Issue**: Chatbot not responding

- **Solution**: Check if LLM is available (`python test_chatbot_flow.py`)
- **Fallback**: System will automatically use intelligent fallback

**Issue**: ML model not categorizing correctly

- **Solution**: Train with more examples
- **Command**: `python manage.py train_models --category=categorization`

**Issue**: Database errors

- **Solution**: Run migrations
- **Command**: `python manage.py makemigrations && python manage.py migrate`

## Production Deployment

### Important Security Settings

Before deploying to production:

1. **Generate a strong SECRET_KEY**:
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```
2. **Set environment variables**:
   ```bash
   export DEBUG=False
   export ALLOWED_HOSTS='yourdomain.com,www.yourdomain.com'
   export DJANGO_SECRET_KEY='your-generated-secret-key'
   ```
3. **Use PostgreSQL** instead of SQLite
4. **Configure HTTPS** and SSL/TLS
5. **Set up proper logging** and monitoring
6. **Use production WSGI server** (Gunicorn, uWSGI)

See `settings_production.py.example` for production configuration template.
**Note**: For production, always set a strong SECRET_KEY and set DEBUG=False.

## Roadmap

### v1.5 (In Progress)

- ✅ Bills management system
- ✅ Savings goals tracking
- ✅ Advanced AI chatbot agent
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics dashboard

### v2.0 (Planned)

- [ ] Banking API integration (Plaid, Open Banking)
- [ ] Automatic transaction import
- [ ] Investment portfolio tracking
- [ ] Tax report generation
- [ ] Multi-language support
- [ ] Mobile-responsive web UI
- [ ] Real-time spending notifications
- [ ] Expense splitting for shared expenses
- [ ] Credit score tracking
- [ ] Financial goal recommendations
- [ ] Cryptocurrency tracking
- [ ] Multi-user household budgets

### v2.5 (Future)

- [ ] Advanced forecasting models
- [ ] Voice commands support
- [ ] Blockchain transaction tracking
- [ ] Financial advisor recommendations
- [ ] Data export (CSV, PDF, Excel)
- [ ] Custom report builder

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow PEP 8 standards
- Use type hints where possible
- Write docstrings for all functions
- Add tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use Smart Finance Tracker in your research, please cite:

```bibtex
@repo{smart_finance_tracker,
  author = {Anurag Baibhav},
  title = {Smart Finance Tracker - AI-Powered Personal Finance Management},
  year = {2024},
  url = {https://github.com/AnuragBaibhav/Smart_Finance_Tracker}
}
```

## Support & Community

- **Issues**: [GitHub Issues](https://github.com/AnuragBaibhav/Smart_Finance_Tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AnuragBaibhav/Smart_Finance_Tracker/discussions)
- **Documentation**: See `/md/` folder for detailed guides

## Acknowledgments

- Django and Django REST Framework communities
- Google Generative AI for Gemini API
- Ollama for local LLM capabilities
- scikit-learn for ML algorithms
- All contributors and users

## Contact

**Author**: Anurag Baibhav  
**Email**: anuragbaibhavrab@gmail.com  
**GitHub**: [@AnuragBaibhav](https://github.com/AnuragBaibhav)

---

**Made with ❤️ for financial freedom**

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Category, Transaction
from .serializers import (
    CategorySerializer,
    TransactionSerializer,
    TransactionCreateSerializer,
)
from ml_features.ml_utils import get_categorizer
from accounts.currency_utils import convert_currency


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for transaction categories
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def income(self, request):
        """Get income categories"""
        categories = Category.objects.filter(category_type="income")
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def expense(self, request):
        """Get expense categories"""
        categories = Category.objects.filter(category_type="expense")
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for transactions
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter transactions by current user"""
        queryset = Transaction.objects.filter(user=self.request.user)

        # Filter by transaction type
        transaction_type = self.request.query_params.get("type", None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        # Filter by date range
        start_date = self.request.query_params.get("start_date", None)
        end_date = self.request.query_params.get("end_date", None)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        # Filter by amount range
        min_amount = self.request.query_params.get("min_amount", None)
        max_amount = self.request.query_params.get("max_amount", None)
        if min_amount:
            queryset = queryset.filter(amount__gte=min_amount)
        if max_amount:
            queryset = queryset.filter(amount__lte=max_amount)

        # Filter by category
        category = self.request.query_params.get("category", None)
        if category:
            queryset = queryset.filter(category_id=category)

        # Filter by search (company / description)
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(description__icontains=search)

        # Filter by account
        account = self.request.query_params.get("account", None)
        if account and account != 'all':
            queryset = queryset.filter(account_id=account)

        return queryset

    def get_serializer_class(self):
        """Use different serializers for create vs list/retrieve"""
        if self.action == "create":
            return TransactionCreateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        """Set user, handle currency conversion, and auto-categorize when creating transaction"""
        input_currency = serializer.validated_data.pop("input_currency", None)
        user = self.request.user
        preferred = user.preferred_currency

        transaction = serializer.save(user=user)

        # Handle currency conversion
        if input_currency and input_currency != preferred:
            original_amount = transaction.amount
            converted_amount, rate = convert_currency(
                float(original_amount), input_currency, preferred
            )
            transaction.original_amount = original_amount
            transaction.original_currency = input_currency
            transaction.amount = converted_amount
            transaction.currency = preferred
            transaction.exchange_rate = rate
            transaction.save()
        else:
            transaction.currency = preferred
            transaction.save()

        # Try to auto-categorize if no category provided
        if not transaction.category and transaction.description:
            categorizer = get_categorizer()
            predicted_category, confidence = categorizer.predict(
                transaction.description
            )

            if predicted_category and confidence > 0.6:
                try:
                    category = Category.objects.get(name=predicted_category)
                    transaction.category = category
                    transaction.auto_categorized = True
                    transaction.save()
                except Category.DoesNotExist:
                    pass

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get transaction summary statistics"""
        queryset = self.get_queryset()

        income = queryset.filter(transaction_type="income").aggregate(
            total=Sum("amount"), count=Count("id")
        )
        expense = queryset.filter(transaction_type="expense").aggregate(
            total=Sum("amount"), count=Count("id")
        )

        return Response(
            {
                "income": {"total": income["total"] or 0, "count": income["count"]},
                "expense": {"total": expense["total"] or 0, "count": expense["count"]},
                "net": (income["total"] or 0) - (expense["total"] or 0),
            }
        )

    @action(detail=False, methods=["get"])
    def by_category(self, request):
        """Get transactions grouped by category"""
        queryset = self.get_queryset()

        # Group by category
        categories_data = (
            queryset.values("category__name", "transaction_type")
            .annotate(total=Sum("amount"), count=Count("id"))
            .order_by("-total")
        )

        return Response(list(categories_data))

    @action(detail=False, methods=["get"])
    def export_pdf(self, request):
        """Generate a PDF report of filtered transactions"""
        from django.http import HttpResponse
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        import io
        from datetime import datetime

        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate summary before formatting
        income = queryset.filter(transaction_type="income").aggregate(total=Sum("amount"))["total"] or 0
        expense = queryset.filter(transaction_type="expense").aggregate(total=Sum("amount"))["total"] or 0
        net = income - expense

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        elements.append(Paragraph("Transaction Report", styles['Title']))
        elements.append(Spacer(1, 12))

        # Filter Summary
        filter_summary = f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}<br/>"
        if request.query_params.get("type"):
            filter_summary += f"Type: {request.query_params.get('type')}<br/>"
        if request.query_params.get("start_date") or request.query_params.get("end_date"):
            filter_summary += f"Date Range: {request.query_params.get('start_date', 'Any')} to {request.query_params.get('end_date', 'Any')}<br/>"
        if request.query_params.get("min_amount") or request.query_params.get("max_amount"):
            filter_summary += f"Amount Range: {request.query_params.get('min_amount', 'Any')} to {request.query_params.get('max_amount', 'Any')}<br/>"
        
        elements.append(Paragraph(filter_summary, styles['Normal']))
        elements.append(Spacer(1, 12))

        # Financial Summary
        elements.append(Paragraph(f"<b>Total Income:</b> {income:,.2f}", styles['Normal']))
        elements.append(Paragraph(f"<b>Total Expense:</b> {expense:,.2f}", styles['Normal']))
        elements.append(Paragraph(f"<b>Net:</b> {net:,.2f}", styles['Normal']))
        elements.append(Spacer(1, 12))

        # Table Data
        data = [['Date', 'Description', 'Category', 'Type', 'Amount']]
        for t in queryset:
            cat_name = t.category.name if t.category else "Uncategorized"
            data.append([
                t.date.strftime("%Y-%m-%d"),
                (t.description[:30] + '..') if len(t.description) > 30 else t.description,
                cat_name,
                t.transaction_type.capitalize(),
                f"{t.currency} {t.amount:,.2f}"
            ])

        # Table Style
        t = Table(data, colWidths=[80, 160, 100, 70, 90])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (4, 1), (4, -1), 'RIGHT'), # right align amounts
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),  # left align descriptions
        ]))
        
        elements.append(t)
        doc.build(elements)

        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="transaction_report.pdf"'
        return response

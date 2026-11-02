import os
import sys

from django.apps import AppConfig
from django.db import connection
from pymongo.errors import PyMongoError


class FinanceTrackerConfig(AppConfig):
    name = "finance_tracker"

    def ready(self):
        if "runserver" not in sys.argv:
            return
        if os.environ.get("RUN_MAIN") != "true" and "--noreload" not in sys.argv:
            return

        try:
            connection.ensure_connection()
            connection.connection.admin.command("ping")
            database_name = connection.settings_dict.get("NAME", "smart_finance_tracker")
            host = connection.settings_dict.get("HOST", "localhost")
            is_atlas = "mongodb.net" in host or "mongodb+srv" in host
            db_label = "MongoDB Atlas (Cloud)" if is_atlas else "Local MongoDB (localhost:27017)"
            print(
                f"\n======================================================\n"
                f"  SUCCESS: MongoDB connected and running successfully!\n"
                f"  Target:   {db_label}\n"
                f"  Database: {database_name}\n"
                f"======================================================\n",
                flush=True,
            )
        except (PyMongoError, OSError, ValueError) as exc:
            print(
                f"\n======================================================\n"
                f"  ERROR: MongoDB connection failed!\n"
                f"  Details: {exc}\n"
                f"======================================================\n",
                flush=True,
            )

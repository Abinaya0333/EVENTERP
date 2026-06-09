from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create the configured PostgreSQL database if it does not already exist."

    def handle(self, *args, **options):
        db = settings.DATABASES["default"]
        engine = db.get("ENGINE", "")
        name = db.get("NAME")

        if "postgresql" not in engine:
            self.stdout.write(self.style.WARNING("initdb is only needed for PostgreSQL databases."))
            return

        try:
            import psycopg
            from psycopg import sql
            from psycopg.errors import DuplicateDatabase
        except ImportError as exc:
            raise CommandError("psycopg is required to create a PostgreSQL database.") from exc

        admin_db = db.get("OPTIONS", {}).get("service") or "postgres"
        conn_kwargs = {
            "dbname": admin_db,
            "user": db.get("USER") or None,
            "password": db.get("PASSWORD") or None,
            "host": db.get("HOST") or None,
            "port": db.get("PORT") or None,
            "autocommit": True,
        }
        conn_kwargs = {key: value for key, value in conn_kwargs.items() if value not in ("", None)}

        try:
            with psycopg.connect(**conn_kwargs) as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", [name])
                    if cursor.fetchone():
                        self.stdout.write(self.style.SUCCESS(f'Database "{name}" already exists.'))
                        return
                    cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(name)))
        except DuplicateDatabase:
            self.stdout.write(self.style.SUCCESS(f'Database "{name}" already exists.'))
            return
        except psycopg.Error as exc:
            raise CommandError(f'Could not create database "{name}": {exc}') from exc

        self.stdout.write(self.style.SUCCESS(f'Created database "{name}".'))

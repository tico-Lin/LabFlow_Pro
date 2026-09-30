import logging
import os
import secrets
import string

logger = logging.getLogger(__name__)


def generate_secure_password(length: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(alphabet) for _ in range(length))


def init_db(admin_password: str | None = None) -> str:
    if admin_password is None:
        admin_password = os.environ.get("ADMIN_PASSWORD")

    if admin_password is None:
        admin_password = generate_secure_password()
        print(f"[SECURITY] Administrator password generated: {admin_password}")
        print("[SECURITY] Please save this password immediately. It will not be shown again.")

    logger.info("Initializing database with admin password: [SECURED]")
    return admin_password

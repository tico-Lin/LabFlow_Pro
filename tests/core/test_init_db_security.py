import logging
import os

from labflow.server.init_db import init_db


def test_init_db_no_password_leak(caplog):
    os.environ.pop("ADMIN_PASSWORD", None)

    with caplog.at_level(logging.DEBUG):
        init_db("supersecretpassword")

    assert "supersecretpassword" not in caplog.text
    assert "[SECURED]" in caplog.text


def test_init_db_generates_random_password_if_not_provided(caplog):
    os.environ.pop("ADMIN_PASSWORD", None)

    with caplog.at_level(logging.INFO):
        password = init_db()

    assert len(password) >= 16
    assert "[SECURED]" in caplog.text
    assert password not in caplog.text


def test_init_db_uses_env_password_if_provided():
    os.environ["ADMIN_PASSWORD"] = "envsecretpassword"
    try:
        assert init_db() == "envsecretpassword"
    finally:
        del os.environ["ADMIN_PASSWORD"]

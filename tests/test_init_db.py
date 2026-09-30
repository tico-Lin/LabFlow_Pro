import logging
from labflow.server.init_db import init_db

def test_init_db_no_password_leak(caplog):
    with caplog.at_level(logging.DEBUG):
        init_db("supersecretpassword")
    
    assert "supersecretpassword" not in caplog.text
    assert "[SECURED]" in caplog.text


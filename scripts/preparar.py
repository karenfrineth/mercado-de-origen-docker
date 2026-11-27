"""Genera la configuración local la primera vez, con permisos privados."""
import base64
import os
from pathlib import Path
import secrets

root = Path(__file__).resolve().parents[1]
values = {
    "APP_KEY": "base64:" + base64.b64encode(secrets.token_bytes(32)).decode(),
    "JWT_SECRET": secrets.token_hex(32),
    "MYSQL_PASSWORD": secrets.token_hex(24),
    "MYSQL_ROOT_PASSWORD": secrets.token_hex(24),
}
lines = (root / ".env.example").read_text().splitlines()
try:
    fd = os.open(root / ".env", os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
except FileExistsError:
    print("La configuración .env ya existe.")
else:
    with os.fdopen(fd, "w") as config:
        for line in lines:
            key = line.partition("=")[0]
            print(f"{key}={values[key]}" if key in values else line, file=config)
    print("Configuración creada en .env.")

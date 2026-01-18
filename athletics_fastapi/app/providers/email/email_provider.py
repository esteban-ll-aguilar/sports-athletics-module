import smtplib
from email.message import EmailMessage
from app.core.config.enviroment import _SETTINGS


class EmailProvider:
    def __init__(self) -> None:
        self.host = _SETTINGS.email_host
        self.port = _SETTINGS.email_port
        self.use_tls = _SETTINGS.email_use_tls
        self.username = _SETTINGS.email_host_user
        self.password = _SETTINGS.email_host_password
        if not self.username or not self.password:
            raise RuntimeError("Email creds not configured (EMAIL_HOST_USER / EMAIL_HOST_PASSWORD)")

    def _send_email(self, to_email: str, subject: str, body: str) -> None:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = self.username
        msg["To"] = to_email
        msg.set_content(body)
        msg.add_alternative(self.generate_html(subject, body), subtype="html")

        if self.use_tls:
            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
        else:
            with smtplib.SMTP_SSL(self.host, self.port, timeout=10) as server:
                server.login(self.username, self.password)
                server.send_message(msg)


    def generate_html(self, subject: str, body: str) -> str:
        return f"""
        <html>
            <head>
                <title>{subject}</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                    }}
                    h1 {{
                        color: #333;
                    }}
                    p {{
                        color: #555;
                    }}
                </style>
            </head>
            <body>
                <h1>{subject}</h1>
                <p>{body}</p>
            </body>
        </html>
        """
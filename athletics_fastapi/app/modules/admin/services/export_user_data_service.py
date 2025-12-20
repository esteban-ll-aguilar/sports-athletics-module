from app.core.db.sync_session import SessionLocal
from app.modules.auth.domain.models.auth_user_model import AuthUserModel

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


def export_users_to_pdf(output_path="usuarios.pdf"):
    db = SessionLocal()

    try:
        users = db.query(AuthUserModel).all()

        if not users:
            print("No hay usuarios en la base de datos.")
            return

        # Crear PDF
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter

        c.setFont("Helvetica", 12)
        c.drawString(50, height - 50, "Listado de Usuarios Registrados")

        y = height - 90  # posición inicial para escribir

        for user in users:
            line = f"ID: {user.id} | Email: {user.email} | Rol: {user.role}"
            c.drawString(50, y, line)

            y -= 20

            # Si se llena la página, crear una nueva
            if y < 50:
                c.showPage()
                c.setFont("Helvetica", 12)
                y = height - 50

        c.save()
        print(f"PDF generado correctamente: {output_path}")

    finally:
        db.close()


if __name__ == "__main__":
    export_users_to_pdf()

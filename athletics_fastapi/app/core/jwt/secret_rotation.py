"""
Sistema de rotación de JWT secrets para mayor seguridad.
Permite mantener múltiples secrets activos durante el período de transición.
"""
import secrets
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Dict


class JWTSecretRotation:
    """Gestiona la rotación automática de JWT secrets cada 90 días."""
    
    def __init__(self, secrets_file: str = "jwt_secrets.json"):
        self.secrets_file = Path(secrets_file)
        self.rotation_days = 90
        self.grace_period_days = 30  # Período de gracia para tokens antiguos
        
    def _generate_secret(self) -> str:
        """Genera un secret aleatorio criptográficamente seguro."""
        return secrets.token_urlsafe(64)
    
    def _load_secrets(self) -> List[Dict]:
        """Carga los secrets del archivo."""
        if not self.secrets_file.exists():
            return []
        
        try:
            with open(self.secrets_file, 'r') as f:
                data = json.load(f)
                return data.get('secrets', [])
        except Exception:
            return []
    
    def _save_secrets(self, secrets_list: List[Dict]) -> None:
        """Guarda los secrets en el archivo."""
        data = {
            'secrets': secrets_list,
            'last_updated': datetime.now(timezone.utc).isoformat()
        }
        
        with open(self.secrets_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def initialize(self) -> str:
        """
        Inicializa el sistema con un secret si no existe.
        Retorna el secret actual.
        """
        secrets_list = self._load_secrets()
        
        if not secrets_list:
            # Crear primer secret
            new_secret = {
                'secret': self._generate_secret(),
                'created_at': datetime.now(timezone.utc).isoformat(),
                'active': True
            }
            secrets_list.append(new_secret)
            self._save_secrets(secrets_list)
            return new_secret['secret']
        
        # Retornar el secret activo
        active = next((s for s in secrets_list if s.get('active')), None)
        return active['secret'] if active else secrets_list[0]['secret']
    
    def get_current_secret(self) -> str:
        """Obtiene el secret actualmente activo para FIRMAR nuevos tokens."""
        secrets_list = self._load_secrets()
        
        if not secrets_list:
            return self.initialize()
        
        # Buscar el secret activo más reciente
        active_secrets = [s for s in secrets_list if s.get('active', False)]
        
        if not active_secrets:
            return self.initialize()
        
        # Retornar el más reciente
        active_secrets.sort(key=lambda x: x['created_at'], reverse=True)
        return active_secrets[0]['secret']
    
    def get_all_valid_secrets(self) -> List[str]:
        """
        Obtiene TODOS los secrets válidos para VERIFICAR tokens.
        Incluye el activo y los que están en período de gracia.
        """
        secrets_list = self._load_secrets()
        valid_secrets = []
        now = datetime.now(timezone.utc)
        
        for secret_data in secrets_list:
            created_at = datetime.fromisoformat(secret_data['created_at'])
            age_days = (now - created_at).days
            
            # Incluir si está activo O dentro del período de gracia
            if secret_data.get('active') or age_days <= (self.rotation_days + self.grace_period_days):
                valid_secrets.append(secret_data['secret'])
        
        return valid_secrets if valid_secrets else [self.get_current_secret()]
    
    def should_rotate(self) -> bool:
        """Verifica si es momento de rotar el secret."""
        secrets_list = self._load_secrets()
        
        if not secrets_list:
            return False
        
        # Buscar el secret activo más reciente
        active_secrets = [s for s in secrets_list if s.get('active', False)]
        
        if not active_secrets:
            return True
        
        active_secrets.sort(key=lambda x: x['created_at'], reverse=True)
        current = active_secrets[0]
        
        created_at = datetime.fromisoformat(current['created_at'])
        age_days = (datetime.now(timezone.utc) - created_at).days
        
        return age_days >= self.rotation_days
    
    def rotate(self) -> Dict[str, str]:
        """
        Realiza la rotación del secret.
        Retorna {'old_secret': '...', 'new_secret': '...'}.
        """
        secrets_list = self._load_secrets()
        now = datetime.now(timezone.utc)
        
        # Obtener secret anterior
        old_secret = self.get_current_secret()
        
        # Marcar todos los secrets anteriores como inactivos
        for secret_data in secrets_list:
            secret_data['active'] = False
        
        # Crear nuevo secret
        new_secret = {
            'secret': self._generate_secret(),
            'created_at': now.isoformat(),
            'active': True
        }
        secrets_list.append(new_secret)
        
        # Limpiar secrets muy antiguos (fuera del período de gracia)
        cutoff_date = now - timedelta(days=self.rotation_days + self.grace_period_days)
        secrets_list = [
            s for s in secrets_list
            if datetime.fromisoformat(s['created_at']) > cutoff_date or s['active']
        ]
        
        self._save_secrets(secrets_list)
        
        return {
            'old_secret': old_secret,
            'new_secret': new_secret['secret'],
            'rotated_at': now.isoformat()
        }
    
    def get_rotation_info(self) -> Dict:
        """Obtiene información sobre el estado de rotación."""
        secrets_list = self._load_secrets()
        
        if not secrets_list:
            return {
                'initialized': False,
                'message': 'Sistema no inicializado'
            }
        
        active_secrets = [s for s in secrets_list if s.get('active', False)]
        
        if not active_secrets:
            return {
                'initialized': False,
                'message': 'No hay secret activo'
            }
        
        active_secrets.sort(key=lambda x: x['created_at'], reverse=True)
        current = active_secrets[0]
        
        created_at = datetime.fromisoformat(current['created_at'])
        age_days = (datetime.now(timezone.utc) - created_at).days
        days_until_rotation = self.rotation_days - age_days
        
        return {
            'initialized': True,
            'current_secret_age_days': age_days,
            'days_until_rotation': days_until_rotation,
            'should_rotate': age_days >= self.rotation_days,
            'total_valid_secrets': len(self.get_all_valid_secrets()),
            'active_secrets_count': len(active_secrets),
            'total_secrets_count': len(secrets_list)
        }

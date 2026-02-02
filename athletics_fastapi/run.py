from app.core.config.enviroment import _SETTINGS
import sys

if __name__ == '__main__':
    import uvicorn
    from dotenv import load_dotenv
    load_dotenv()

    from app.core.logging.logger import logger
    logger.info("Starting application...")
    logger.info(f"Listening on http://{_SETTINGS.application_host}:{_SETTINGS.application_port}")
    
    # En Windows, usar reload=False para stress testing (evita error de file descriptors)
    # Pasar --no-reload como argumento para desactivar reload
    use_reload = "--no-reload" not in sys.argv
    
    app_import = "app.main:_APP"
    try:
        logger.info(f"Application started successfully. Reload: {use_reload}")
        uvicorn.run(
            app_import, 
            host=_SETTINGS.application_host, 
            port=_SETTINGS.application_port, 
            reload=use_reload,
            workers=1,  # Un solo worker para evitar problemas en Windows
            limit_concurrency=50,  # Limitar conexiones concurrentes
        )
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        from app.main import _APP
        uvicorn.run(
            _APP, 
            host=_SETTINGS.application_host, 
            port=_SETTINGS.application_port, 
            reload=False
        )
    
    
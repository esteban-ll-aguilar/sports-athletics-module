import sys
from app.core.config.enviroment import _SETTINGS

if __name__ == '__main__':
    import uvicorn
    from dotenv import load_dotenv
    load_dotenv()

    from app.core.logging.logger import logger
    logger.info("Starting application...")
    logger.info(f"Listening on http://{_SETTINGS.application_host}:{_SETTINGS.application_port}")
    logger.info("Application started successfully.")
    
    app_import = "app.main:_APP"
    try:
        uvicorn.run(
            app_import, 
            host=_SETTINGS.application_host, 
            port=_SETTINGS.application_port, 
            reload=True
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
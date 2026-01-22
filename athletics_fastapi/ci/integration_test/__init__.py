"""
Integration Tests Module for Athletics FastAPI Application

This module contains comprehensive integration tests for all services:
- Database (PostgreSQL)
- Cache (Redis)
- Email (SMTP)
- API Endpoints
- External Services (Spring Boot)

Usage:
    python -m ci.integration_test
    python ci/integration_test/run_tests.py --type database
    pytest ci/integration_test/ -v

For more information, see README.md
"""

__version__ = "1.0.0"
__author__ = "Athletics Module Team"

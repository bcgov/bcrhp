import os
import pytest
from dotenv import load_dotenv

# Load .env from tests/playwright/.env (parallel to the TS config)
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    return {
        **browser_context_args,
        "ignore_https_errors": True,
        "viewport": {"width": 1440, "height": 1024},
    }


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args):
    return {
        **browser_type_launch_args,
        "headless": False,
    }

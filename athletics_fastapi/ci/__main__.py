import sys
import subprocess
import os


def print_tile(
    mensaje: str,
    is_red: bool = False,
    is_green: bool = False,
    is_yellow: bool = False,
    is_blue: bool = True
):
    if is_red:
        color = "\033[91m"
    elif is_green:
        color = "\033[92m"
    elif is_yellow:
        color = "\033[93m"
    elif is_blue:
        color = "\033[94m"
    else:
        color = "\033[0m"

    reset = "\033[0m"
    line = "=" * 40

    print(f"{color}{line}{reset}")
    print(f"{color}{mensaje}{reset}")
    print(f"{color}{line}{reset}\n")


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, base_dir)

    print_tile(f"Base directory: {base_dir}", is_blue=True)

    print_tile("RUNING UNITARY TESTS", is_blue=True)

    # Ejecutar el script de pruebas directamente
    tests_passed = subprocess.run(
        [sys.executable, "tests/tests.py"],
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    if tests_passed.returncode != 0:
        sys.exit(tests_passed.returncode)

    print_tile("ALL TESTS PASSED SUCCESSFULLY", is_green=True)

    print_tile("RUNNING INTEGRATION TESTS")

    # Ejecutar pruebas de integración
    integration_tests = subprocess.run(
        [sys.executable, "-m", "ci.integration_test"],
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    if integration_tests.returncode != 0:
        print_tile("INTEGRATION TESTS FAILED", is_red=True)
        sys.exit(integration_tests.returncode)

    print_tile("ALL INTEGRATION TESTS PASSED SUCCESSFULLY", is_green=True)
    print_tile("🎉 ALL TESTS COMPLETED SUCCESSFULLY 🎉", is_green=True)
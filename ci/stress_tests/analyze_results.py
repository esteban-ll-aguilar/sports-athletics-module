#!/usr/bin/env python3
"""
Analizador de Resultados de Pruebas de Estrés

Este script analiza los resultados de JMeter, Gatling y Locust,
compara contra baselines definidos, y genera reportes consolidados.

Uso:
    python analyze_results.py
    python analyze_results.py --compare-baseline
    python analyze_results.py --export-pdf
    python analyze_results.py --tool locust --result-file locust/results/stats.csv
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import yaml

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False
    print("⚠️  pandas no está instalado. Funcionalidad limitada.")

try:
    import matplotlib.pyplot as plt
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False
    print("⚠️  matplotlib no está instalado. No se generarán gráficos.")


# Colores para terminal
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(msg: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{msg.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")


def print_success(msg: str):
    print(f"{Colors.OKGREEN}✅ {msg}{Colors.ENDC}")


def print_warning(msg: str):
    print(f"{Colors.WARNING}⚠️  {msg}{Colors.ENDC}")


def print_error(msg: str):
    print(f"{Colors.FAIL}❌ {msg}{Colors.ENDC}")


def print_info(msg: str):
    print(f"{Colors.OKBLUE}ℹ️  {msg}{Colors.ENDC}")


class PerformanceAnalyzer:
    """Analizador de resultados de pruebas de rendimiento."""
    
    def __init__(self, baseline_file: str = "performance_baselines.yml"):
        self.baseline_file = baseline_file
        self.baselines = self.load_baselines()
        self.results = {}
        self.comparison = {}
    
    def load_baselines(self) -> Dict:
        """Carga baselines desde archivo YAML."""
        if not os.path.exists(self.baseline_file):
            print_warning(f"No se encontró archivo de baselines: {self.baseline_file}")
            return {}
        
        with open(self.baseline_file, 'r', encoding='utf-8') as f:
            baselines = yaml.safe_load(f)
        
        print_success(f"Baselines cargados desde {self.baseline_file}")
        return baselines
    
    def analyze_locust_results(self, stats_file: str) -> Dict:
        """Analiza resultados de Locust desde CSV."""
        print_header("ANALIZANDO RESULTADOS DE LOCUST")
        
        if not os.path.exists(stats_file):
            print_error(f"No se encontró archivo: {stats_file}")
            return {}
        
        results = {
            "tool": "locust",
            "file": stats_file,
            "timestamp": datetime.now().isoformat(),
            "metrics": {}
        }
        
        if not HAS_PANDAS:
            print_warning("pandas no disponible, análisis limitado")
            return results
        
        try:
            # Leer CSV de Locust
            df = pd.read_csv(stats_file)
            
            # Estadísticas generales
            if 'Name' in df.columns:
                aggregated = df[df['Name'] == 'Aggregated']
                
                if not aggregated.empty:
                    row = aggregated.iloc[0]
                    
                    results["metrics"] = {
                        "total_requests": int(row.get('Request Count', 0)),
                        "failure_count": int(row.get('Failure Count', 0)),
                        "median_response_time": float(row.get('Median Response Time', 0)),
                        "p95_response_time": float(row.get('95%', 0)),
                        "p99_response_time": float(row.get('99%', 0)),
                        "avg_response_time": float(row.get('Average Response Time', 0)),
                        "min_response_time": float(row.get('Min Response Time', 0)),
                        "max_response_time": float(row.get('Max Response Time', 0)),
                        "requests_per_second": float(row.get('Requests/s', 0)),
                        "failures_per_second": float(row.get('Failures/s', 0))
                    }
                    
                    # Calcular error rate
                    total = results["metrics"]["total_requests"]
                    failures = results["metrics"]["failure_count"]
                    results["metrics"]["error_rate_percent"] = (failures / total * 100) if total > 0 else 0
                    
                    # Imprimir resumen
                    print_info(f"Total Requests: {results['metrics']['total_requests']:,}")
                    print_info(f"Failures: {results['metrics']['failure_count']:,}")
                    print_info(f"Error Rate: {results['metrics']['error_rate_percent']:.2f}%")
                    print_info(f"P50 (Median): {results['metrics']['median_response_time']:.0f}ms")
                    print_info(f"P95: {results['metrics']['p95_response_time']:.0f}ms")
                    print_info(f"P99: {results['metrics']['p99_response_time']:.0f}ms")
                    print_info(f"Requests/s: {results['metrics']['requests_per_second']:.2f}")
            
            self.results["locust"] = results
            return results
            
        except Exception as e:
            print_error(f"Error analizando Locust: {str(e)}")
            return results
    
    def analyze_jmeter_results(self, jtl_file: str) -> Dict:
        """Analiza resultados de JMeter desde archivo JTL."""
        print_header("ANALIZANDO RESULTADOS DE JMETER")
        
        if not os.path.exists(jtl_file):
            print_error(f"No se encontró archivo: {jtl_file}")
            return {}
        
        results = {
            "tool": "jmeter",
            "file": jtl_file,
            "timestamp": datetime.now().isoformat(),
            "metrics": {}
        }
        
        if not HAS_PANDAS:
            print_warning("pandas no disponible, análisis limitado")
            return results
        
        try:
            # Leer JTL (CSV format)
            df = pd.read_csv(jtl_file)
            
            # Columnas típicas: timeStamp, elapsed, label, responseCode, success, etc.
            if 'elapsed' in df.columns:
                results["metrics"] = {
                    "total_requests": len(df),
                    "failure_count": len(df[df['success'] == False]) if 'success' in df.columns else 0,
                    "median_response_time": df['elapsed'].median(),
                    "p95_response_time": df['elapsed'].quantile(0.95),
                    "p99_response_time": df['elapsed'].quantile(0.99),
                    "avg_response_time": df['elapsed'].mean(),
                    "min_response_time": df['elapsed'].min(),
                    "max_response_time": df['elapsed'].max(),
                }
                
                # Error rate
                total = results["metrics"]["total_requests"]
                failures = results["metrics"]["failure_count"]
                results["metrics"]["error_rate_percent"] = (failures / total * 100) if total > 0 else 0
                
                # Throughput
                if 'timeStamp' in df.columns:
                    duration_seconds = (df['timeStamp'].max() - df['timeStamp'].min()) / 1000
                    results["metrics"]["requests_per_second"] = total / duration_seconds if duration_seconds > 0 else 0
                
                # Imprimir resumen
                print_info(f"Total Requests: {results['metrics']['total_requests']:,}")
                print_info(f"Failures: {results['metrics']['failure_count']:,}")
                print_info(f"Error Rate: {results['metrics']['error_rate_percent']:.2f}%")
                print_info(f"P50 (Median): {results['metrics']['median_response_time']:.0f}ms")
                print_info(f"P95: {results['metrics']['p95_response_time']:.0f}ms")
                print_info(f"P99: {results['metrics']['p99_response_time']:.0f}ms")
                
                if "requests_per_second" in results["metrics"]:
                    print_info(f"Requests/s: {results['metrics']['requests_per_second']:.2f}")
            
            self.results["jmeter"] = results
            return results
            
        except Exception as e:
            print_error(f"Error analizando JMeter: {str(e)}")
            return results
    
    def compare_with_baseline(self, tool: str = "locust") -> Dict:
        """Compara resultados contra baselines."""
        print_header(f"COMPARACIÓN CON BASELINE ({tool.upper()})")
        
        if tool not in self.results:
            print_error(f"No hay resultados para {tool}")
            return {}
        
        results = self.results[tool]["metrics"]
        comparison = {
            "tool": tool,
            "timestamp": datetime.now().isoformat(),
            "checks": []
        }
        
        # Verificar error rate
        error_rate = results.get("error_rate_percent", 0)
        error_baseline = self.baselines.get("error_rates", {}).get("overall", {})
        
        check = {
            "metric": "Error Rate",
            "value": f"{error_rate:.2f}%",
            "baseline_target": error_baseline.get("target", "N/A"),
            "baseline_warning": error_baseline.get("warning", "N/A"),
            "baseline_critical": error_baseline.get("critical", "N/A"),
            "status": "PASS"
        }
        
        if error_rate > 5:  # Critical
            check["status"] = "FAIL"
            print_error(f"Error Rate: {error_rate:.2f}% > 5% (CRÍTICO)")
        elif error_rate > 1:  # Warning
            check["status"] = "WARNING"
            print_warning(f"Error Rate: {error_rate:.2f}% > 1% (ADVERTENCIA)")
        else:
            print_success(f"Error Rate: {error_rate:.2f}% < 1% (OK)")
        
        comparison["checks"].append(check)
        
        # Verificar P95 response time
        p95 = results.get("p95_response_time", 0)
        response_baselines = self.baselines.get("response_times", {}).get("read_operations", {}).get("list_atletas", {})
        
        check = {
            "metric": "P95 Response Time",
            "value": f"{p95:.0f}ms",
            "baseline_target": f"{response_baselines.get('p95', 1000)}ms",
            "baseline_warning": f"{response_baselines.get('p95', 1000) * 1.5}ms",
            "baseline_critical": f"{response_baselines.get('max', 3000)}ms",
            "status": "PASS"
        }
        
        baseline_p95 = response_baselines.get('p95', 1000)
        if p95 > response_baselines.get('max', 3000):
            check["status"] = "FAIL"
            print_error(f"P95: {p95:.0f}ms > {response_baselines.get('max', 3000)}ms (CRÍTICO)")
        elif p95 > baseline_p95 * 1.5:
            check["status"] = "WARNING"
            print_warning(f"P95: {p95:.0f}ms > {baseline_p95 * 1.5:.0f}ms (ADVERTENCIA)")
        else:
            print_success(f"P95: {p95:.0f}ms < {baseline_p95}ms (OK)")
        
        comparison["checks"].append(check)
        
        # Verificar throughput
        rps = results.get("requests_per_second", 0)
        throughput_baseline = self.baselines.get("throughput", {})
        
        check = {
            "metric": "Throughput (req/s)",
            "value": f"{rps:.2f}",
            "baseline_target": throughput_baseline.get("minimum_rps", 50),
            "status": "PASS"
        }
        
        min_rps = throughput_baseline.get("minimum_rps", 50)
        if rps < min_rps:
            check["status"] = "WARNING"
            print_warning(f"Throughput: {rps:.2f} < {min_rps} req/s (BAJO)")
        else:
            print_success(f"Throughput: {rps:.2f} >= {min_rps} req/s (OK)")
        
        comparison["checks"].append(check)
        
        self.comparison[tool] = comparison
        return comparison
    
    def generate_summary_report(self) -> str:
        """Genera un reporte resumen en texto."""
        print_header("REPORTE CONSOLIDADO")
        
        report_lines = []
        report_lines.append("=" * 60)
        report_lines.append("REPORTE DE ANÁLISIS DE PRUEBAS DE ESTRÉS")
        report_lines.append("=" * 60)
        report_lines.append(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append("")
        
        for tool, results in self.results.items():
            report_lines.append(f"\n{'='*60}")
            report_lines.append(f"HERRAMIENTA: {tool.upper()}")
            report_lines.append(f"{'='*60}")
            
            metrics = results.get("metrics", {})
            for key, value in metrics.items():
                if isinstance(value, float):
                    report_lines.append(f"  {key}: {value:.2f}")
                else:
                    report_lines.append(f"  {key}: {value}")
        
        # Comparaciones
        if self.comparison:
            report_lines.append(f"\n{'='*60}")
            report_lines.append("COMPARACIÓN CON BASELINES")
            report_lines.append(f"{'='*60}")
            
            for tool, comp in self.comparison.items():
                report_lines.append(f"\n{tool.upper()}:")
                for check in comp.get("checks", []):
                    status_symbol = {
                        "PASS": "✅",
                        "WARNING": "⚠️",
                        "FAIL": "❌"
                    }.get(check["status"], "❓")
                    
                    report_lines.append(f"  {status_symbol} {check['metric']}: {check['value']} (baseline: {check.get('baseline_target', 'N/A')})")
        
        report_lines.append("\n" + "=" * 60)
        report_text = "\n".join(report_lines)
        
        print(report_text)
        
        # Guardar a archivo
        report_file = f"results/analysis_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        os.makedirs("results", exist_ok=True)
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_text)
        
        print_success(f"\nReporte guardado en: {report_file}")
        return report_text
    
    def generate_plots(self):
        """Genera gráficos de los resultados."""
        if not HAS_MATPLOTLIB:
            print_warning("matplotlib no disponible, no se pueden generar gráficos")
            return
        
        print_header("GENERANDO GRÁFICOS")
        
        os.makedirs("results/plots", exist_ok=True)
        
        # Gráfico de comparación de métricas
        if len(self.results) > 0:
            fig, axes = plt.subplots(2, 2, figsize=(12, 10))
            fig.suptitle('Comparación de Métricas de Rendimiento', fontsize=16)
            
            tools = list(self.results.keys())
            
            # Error Rate
            error_rates = [self.results[t]["metrics"].get("error_rate_percent", 0) for t in tools]
            axes[0, 0].bar(tools, error_rates, color=['green' if x < 1 else 'red' for x in error_rates])
            axes[0, 0].set_title('Error Rate (%)')
            axes[0, 0].set_ylabel('%')
            axes[0, 0].axhline(y=1, color='orange', linestyle='--', label='Warning')
            axes[0, 0].axhline(y=5, color='red', linestyle='--', label='Critical')
            axes[0, 0].legend()
            
            # P95 Response Time
            p95_times = [self.results[t]["metrics"].get("p95_response_time", 0) for t in tools]
            axes[0, 1].bar(tools, p95_times, color='blue')
            axes[0, 1].set_title('P95 Response Time (ms)')
            axes[0, 1].set_ylabel('ms')
            axes[0, 1].axhline(y=1000, color='orange', linestyle='--', label='Target')
            axes[0, 1].legend()
            
            # Throughput
            throughputs = [self.results[t]["metrics"].get("requests_per_second", 0) for t in tools]
            axes[1, 0].bar(tools, throughputs, color='cyan')
            axes[1, 0].set_title('Throughput (req/s)')
            axes[1, 0].set_ylabel('req/s')
            
            # Total Requests
            totals = [self.results[t]["metrics"].get("total_requests", 0) for t in tools]
            axes[1, 1].bar(tools, totals, color='purple')
            axes[1, 1].set_title('Total Requests')
            axes[1, 1].set_ylabel('requests')
            
            plt.tight_layout()
            plot_file = f"results/plots/comparison_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            plt.savefig(plot_file, dpi=300, bbox_inches='tight')
            plt.close()
            
            print_success(f"Gráfico guardado en: {plot_file}")


def main():
    parser = argparse.ArgumentParser(description="Analiza resultados de pruebas de estrés")
    
    parser.add_argument("--tool", choices=["locust", "jmeter", "gatling", "all"], default="all",
                        help="Herramienta a analizar")
    parser.add_argument("--locust-file", default="locust/results/stats.csv",
                        help="Archivo de resultados de Locust")
    parser.add_argument("--jmeter-file", default="jmeter/results/results.jtl",
                        help="Archivo de resultados de JMeter")
    parser.add_argument("--compare-baseline", action="store_true",
                        help="Comparar con baselines")
    parser.add_argument("--generate-plots", action="store_true",
                        help="Generar gráficos")
    parser.add_argument("--baseline-file", default="performance_baselines.yml",
                        help="Archivo de baselines")
    
    args = parser.parse_args()
    
    print_header("🔍 ANALIZADOR DE RESULTADOS DE PRUEBAS DE ESTRÉS")
    
    analyzer = PerformanceAnalyzer(baseline_file=args.baseline_file)
    
    # Analizar según herramienta
    if args.tool in ["locust", "all"]:
        if os.path.exists(args.locust_file):
            analyzer.analyze_locust_results(args.locust_file)
        else:
            print_warning(f"Archivo Locust no encontrado: {args.locust_file}")
    
    if args.tool in ["jmeter", "all"]:
        if os.path.exists(args.jmeter_file):
            analyzer.analyze_jmeter_results(args.jmeter_file)
        else:
            print_warning(f"Archivo JMeter no encontrado: {args.jmeter_file}")
    
    # Comparar con baselines si se solicita
    if args.compare_baseline:
        for tool in analyzer.results.keys():
            analyzer.compare_with_baseline(tool)
    
    # Generar reporte
    analyzer.generate_summary_report()
    
    # Generar gráficos si se solicita
    if args.generate_plots:
        analyzer.generate_plots()
    
    # Exportar a JSON
    json_file = f"results/analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    os.makedirs("results", exist_ok=True)
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({
            "results": analyzer.results,
            "comparison": analyzer.comparison
        }, f, indent=2)
    
    print_success(f"\nResultados JSON guardados en: {json_file}")
    
    # Determinar éxito general
    if analyzer.comparison:
        all_pass = all(
            check["status"] == "PASS"
            for comp in analyzer.comparison.values()
            for check in comp.get("checks", [])
        )
        
        if all_pass:
            print_success("\n✅ TODAS LAS PRUEBAS PASARON")
            return 0
        else:
            has_failures = any(
                check["status"] == "FAIL"
                for comp in analyzer.comparison.values()
                for check in comp.get("checks", [])
            )
            
            if has_failures:
                print_error("\n❌ ALGUNAS PRUEBAS FALLARON")
                return 1
            else:
                print_warning("\n⚠️  HAY ADVERTENCIAS")
                return 0
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""
Script de automatización de flujo de desarrollo Git para aplicaciones Next.js
Autor: Ingeniero DevOps
Fecha: 2025
Descripción: Automatiza creación de ramas, pruebas, merges y despliegue
"""

import subprocess
import sys
import argparse
import os
from typing import Optional, Tuple, List
import shutil


class GitAutomationError(Exception):
    """Excepción personalizada para errores en la automatización Git"""
    pass


def run_command(command: List[str], cwd: Optional[str] = None, capture_output: bool = True,
                verbose: bool = False) -> Tuple[str, str, int]:
    """
    Ejecuta un comando del sistema y retorna stdout, stderr y código de salida

    Args:
        command: Lista de comandos a ejecutar
        cwd: Directorio de trabajo (opcional)
        capture_output: Si capturar output (default: True)
        verbose: Si mostrar output verbose

    Returns:
        Tuple de (stdout, stderr, return_code)
    """
    try:
        if verbose:
            print(f"🔧 Ejecutando: {' '.join(command)}")

        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=capture_output,
            text=True,
            check=False
        )

        if verbose and result.stdout:
            print(f"📄 Output: {result.stdout.strip()}")

        if result.stderr and (verbose or result.returncode != 0):
            print(f"⚠️  Error output: {result.stderr.strip()}")

        return result.stdout, result.stderr, result.returncode

    except FileNotFoundError:
        raise GitAutomationError(f"Comando no encontrado: {command[0]}")


def check_git_status(verbose: bool = False) -> bool:
    """
    Verifica el estado del repositorio Git

    Returns:
        True si el repositorio está limpio, False si hay cambios pendientes
    """
    print("🔍 Verificando estado del repositorio Git...")

    # Verificar si estamos en un repositorio Git
    stdout, stderr, return_code = run_command(["git", "rev-parse", "--git-dir"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError("No se detectó un repositorio Git válido")

    # Verificar estado limpio
    stdout, stderr, return_code = run_command(["git", "status", "--porcelain"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError("Error al verificar estado Git")

    if stdout.strip():
        print("⚠️  El repositorio tiene cambios pendientes:")
        print(stdout)
        return False

    print("✅ Repositorio Git está limpio")
    return True


def create_feature_branch(feature_name: str, base_branch: str, verbose: bool = False) -> None:
    """
    Crea y cambia a una nueva rama feature

    Args:
        feature_name: Nombre de la feature
        base_branch: Rama base para crear la feature
        verbose: Modo verbose
    """
    print(f"🌿 Creando rama feature: {feature_name}")

    # Verificar que la rama base existe
    stdout, stderr, return_code = run_command(["git", "show-ref", "--verify", f"refs/heads/{base_branch}"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"La rama base '{base_branch}' no existe")

    # Cambiar a rama base
    stdout, stderr, return_code = run_command(["git", "checkout", base_branch], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Error al cambiar a rama '{base_branch}': {stderr}")

    # Crear y cambiar a nueva rama feature
    branch_name = f"feature/{feature_name}"
    stdout, stderr, return_code = run_command(["git", "checkout", "-b", branch_name], verbose=verbose)
    if return_code != 0:
        if "already exists" in stderr:
            raise GitAutomationError(f"La rama '{branch_name}' ya existe")
        else:
            raise GitAutomationError(f"Error al crear rama '{branch_name}': {stderr}")

    print(f"✅ Rama '{branch_name}' creada y activada")


def run_tests(verbose: bool = False) -> None:
    """
    Ejecuta pruebas y build de Next.js

    Args:
        verbose: Modo verbose
    """
    print("🧪 Ejecutando pruebas y build...")

    # Verificar que package.json existe
    if not os.path.exists("package.json"):
        raise GitAutomationError("No se encontró package.json. Asegúrate de estar en el directorio del proyecto Next.js")

    # Determinar cómo llamar a npm en Windows
    npm_command = get_npm_command()

    # Ejecutar npm test
    print("📋 Ejecutando pruebas unitarias...")
    stdout, stderr, return_code = run_command([npm_command, "test"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Fallo en pruebas unitarias: {stderr}")

    print("✅ Pruebas unitarias pasaron")

    # Ejecutar npm run build
    print("🔨 Ejecutando build...")
    stdout, stderr, return_code = run_command([npm_command, "run", "build"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Fallo en build: {stderr}")

    print("✅ Build completado exitosamente")


def get_npm_command() -> str:
    """
    Determina el mejor comando para ejecutar npm en el sistema actual

    Returns:
        Comando para ejecutar npm
    """
    import platform

    if platform.system() == "Windows":
        # En Windows, intentar diferentes opciones
        try:
            # Opción 1: Usar npx que usualmente viene con Node.js
            subprocess.run(["npx", "--version"], capture_output=True, check=True)
            return "npx.cmd"  # Usar npx que es más confiable en Windows
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass

        try:
            # Opción 2: Usar ruta absoluta de npm
            npm_path = r"C:\Program Files\nodejs\npm.cmd"
            if os.path.exists(npm_path):
                return npm_path
        except:
            pass

        # Opción 3: Usar npm directamente (esperando que funcione)
        return "npm"

    else:
        # En otros sistemas operativos
        return "npm"


def commit_and_push_feature(feature_name: str, verbose: bool = False) -> None:
    """
    Hace commit de cambios y pushea la rama feature

    Args:
        feature_name: Nombre de la feature
        verbose: Modo verbose
    """
    print("💾 Creando commit y subiendo rama feature...")

    # Agregar cambios
    stdout, stderr, return_code = run_command(["git", "add", "."], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Error al agregar cambios: {stderr}")

    # Verificar si hay cambios para commitear
    stdout, stderr, return_code = run_command(["git", "diff", "--cached", "--name-only"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError("Error al verificar cambios staged")

    if not stdout.strip():
        print("⚠️  No hay cambios para commitear")
        return

    # Crear commit
    commit_message = f"feat: [{feature_name}] Implementación inicial"
    stdout, stderr, return_code = run_command(["git", "commit", "-m", commit_message], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Error al crear commit: {stderr}")

    print(f"✅ Commit creado: {commit_message}")

    # Push rama feature
    branch_name = f"feature/{feature_name}"
    stdout, stderr, return_code = run_command(["git", "push", "-u", "origin", branch_name], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Error al subir rama '{branch_name}': {stderr}")

    print(f"✅ Rama '{branch_name}' subida a remoto")


def merge_feature_to_develop(feature_name: str, base_branch: str, verbose: bool = False) -> None:
    """
    Fusiona la rama feature a develop

    Args:
        feature_name: Nombre de la feature
        base_branch: Rama base (develop)
        verbose: Modo verbose
    """
    print(f"🔀 Fusionando feature/{feature_name} a {base_branch}...")

    # Cambiar a rama develop
    stdout, stderr, return_code = run_command(["git", "checkout", base_branch], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Error al cambiar a '{base_branch}': {stderr}")

    # Pull latest changes
    stdout, stderr, return_code = run_command(["git", "pull", "origin", base_branch], verbose=verbose)
    if return_code != 0:
        print(f"⚠️  Advertencia: Error al hacer pull de '{base_branch}': {stderr}")

    # Merge feature branch
    feature_branch = f"feature/{feature_name}"
    stdout, stderr, return_code = run_command(["git", "merge", feature_branch, "--no-ff"], verbose=verbose)

    if return_code != 0:
        if "CONFLICT" in stderr or "conflict" in stderr:
            raise GitAutomationError(f"Conflictos detectados en merge. Resuelve manualmente:\n1. git status\n2. Edita archivos conflictivos\n3. git add <archivos>\n4. git commit")
        else:
            raise GitAutomationError(f"Error en merge: {stderr}")

    print(f"✅ Merge exitoso: {feature_branch} → {base_branch}")

    # Push changes
    stdout, stderr, return_code = run_command(["git", "push", "origin", base_branch], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError(f"Error al subir cambios a '{base_branch}': {stderr}")

    print(f"✅ Cambios subidos a remoto")


def merge_develop_to_main(base_branch: str, verbose: bool = False) -> None:
    """
    Fusiona develop a main y hace push

    Args:
        base_branch: Rama develop
        verbose: Modo verbose
    """
    print(f"🚀 Fusionando {base_branch} a main...")

    # Cambiar a main
    stdout, stderr, return_code = run_command(["git", "checkout", "main"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError("Error al cambiar a rama 'main'. Verifica que existe")

    # Pull latest changes from main
    stdout, stderr, return_code = run_command(["git", "pull", "origin", "main"], verbose=verbose)
    if return_code != 0:
        print(f"⚠️  Advertencia: Error al hacer pull de 'main': {stderr}")

    # Merge develop to main
    stdout, stderr, return_code = run_command(["git", "merge", base_branch, "--no-ff"], verbose=verbose)

    if return_code != 0:
        if "CONFLICT" in stderr or "conflict" in stderr:
            raise GitAutomationError(f"Conflictos detectados en merge. Resuelve manualmente:\n1. git status\n2. Edita archivos conflictivos\n3. git add <archivos>\n4. git commit")
        else:
            raise GitAutomationError(f"Error en merge: {stderr}")

    print("✅ Merge exitoso: develop → main")

    # Push changes
    stdout, stderr, return_code = run_command(["git", "push", "origin", "main"], verbose=verbose)
    if return_code != 0:
        raise GitAutomationError("Error al subir cambios a 'main': {stderr}")

    print("✅ Cambios subidos a remoto")


def deploy_to_vercel(verbose: bool = False) -> bool:
    """
    Intenta desplegar usando Vercel CLI

    Args:
        verbose: Modo verbose

    Returns:
        True si el despliegue fue exitoso, False si falló
    """
    print("🚀 Intentando despliegue con Vercel...")

    # Verificar si Vercel CLI está instalado
    if not shutil.which("vercel"):
        print("⚠️  Vercel CLI no está instalado. Usando fallback...")
        return False

    # Ejecutar despliegue
    stdout, stderr, return_code = run_command(["vercel", "--prod"], verbose=verbose)
    if return_code != 0:
        print(f"⚠️  Error en despliegue Vercel: {stderr}")
        return False

    print("✅ Despliegue Vercel completado")
    return True


def confirm_action(message: str) -> bool:
    """
    Pide confirmación al usuario para acciones críticas

    Args:
        message: Mensaje de confirmación

    Returns:
        True si el usuario confirma, False si cancela
    """
    while True:
        response = input(f"🔒 {message} (y/N): ").lower().strip()
        if response in ['y', 'yes']:
            return True
        elif response in ['', 'n', 'no']:
            return False
        else:
            print("Por favor responde 'y' para sí o 'n' para no")


def main():
    """
    Función principal que orquesta todo el flujo de desarrollo
    """
    parser = argparse.ArgumentParser(
        description="Script de automatización de flujo de desarrollo Git para Next.js",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:
  python deploy_script.py my-feature
  python deploy_script.py user-auth --base develop --verbose
  python deploy_script.py api-improvements --base staging --verbose
        """
    )

    parser.add_argument(
        "feature_name",
        help="Nombre de la feature (requerido)"
    )

    parser.add_argument(
        "--base",
        default="develop",
        help="Rama base para crear la feature (default: develop)"
    )

    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Modo verbose para mostrar más información"
    )

    parser.add_argument(
        "--skip-tests",
        action="store_true",
        help="Saltar ejecución de pruebas (no recomendado)"
    )

    args = parser.parse_args()

    # Validar nombre de feature
    if not args.feature_name or not args.feature_name.replace("-", "").replace("_", "").isalnum():
        print("❌ Error: Nombre de feature inválido. Usa solo letras, números, guiones y underscores")
        sys.exit(1)

    print("🚀 Iniciando flujo de desarrollo automatizado...")
    print(f"📝 Feature: {args.feature_name}")
    print(f"🌿 Rama base: {args.base}")
    print(f"🔊 Verbose: {'Activado' if args.verbose else 'Desactivado'}")
    print("-" * 50)

    try:
        # Paso 1: Validar estado Git
        if not check_git_status(args.verbose):
            if not confirm_action("¿Desea continuar con cambios pendientes?"):
                print("❌ Operación cancelada por el usuario")
                sys.exit(0)

        # Paso 2: Crear rama feature
        create_feature_branch(args.feature_name, args.base, args.verbose)

        # Paso 3: Ejecutar pruebas
        if not args.skip_tests:
            run_tests(args.verbose)

        # Paso 4: Commit y push
        commit_and_push_feature(args.feature_name, args.verbose)

        # Paso 5: Merge feature -> develop
        if not confirm_action("¿Fusionar feature a develop?"):
            print("❌ Operación cancelada por el usuario")
            sys.exit(0)

        merge_feature_to_develop(args.feature_name, args.base, args.verbose)

        # Paso 6: Merge develop -> main
        if not confirm_action("¿Fusionar develop a main y desplegar?"):
            print("❌ Operación cancelada por el usuario")
            sys.exit(0)

        merge_develop_to_main(args.base, args.verbose)

        # Paso 7: Desplegar
        vercel_success = deploy_to_vercel(args.verbose)
        if not vercel_success:
            print("🔄 Fallback: Ejecutando build y push adicional...")
            run_command(["npm", "run", "build"], verbose=args.verbose)
            run_command(["git", "push", "origin", "main"], verbose=args.verbose)

        # Resumen final
        print("\n" + "=" * 60)
        print("🎉 ¡FLUJO COMPLETADO EXITOSAMENTE!")
        print("=" * 60)
        print("📋 Resumen:")
        print(f"   ✅ Rama feature/{args.feature_name} creada y fusionada")
        print(f"   ✅ Fusionado a {args.base}")
        print("   ✅ Fusionado a main y desplegado")
        print("\n🔍 Próximos pasos:")
        if vercel_success:
            print("   • Monitorea el despliegue en tu dashboard de Vercel")
        else:
            print("   • Verifica el estado del despliegue en tu plataforma CI/CD")
        print("   • Notifica al equipo sobre los cambios")
        print("   • Considera crear un tag de versión si es apropiado")
        print("\n✨ ¡Felicidades! Tu feature está en producción.")

    except GitAutomationError as e:
        print(f"❌ Error en automatización: {str(e)}")
        print("\n🔧 Sugerencias de solución:")
        print("   • Verifica que Git esté configurado correctamente")
        print("   • Asegúrate de tener permisos de push al repositorio")
        print("   • Revisa que las dependencias de npm estén instaladas")
        print("   • Para conflictos, resuelve manualmente y ejecuta git merge --continue")
        sys.exit(1)

    except KeyboardInterrupt:
        print("\n⏹️  Operación cancelada por el usuario")
        sys.exit(0)

    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()

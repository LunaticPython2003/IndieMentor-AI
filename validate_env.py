#!/usr/bin/env python3
"""
Environment validation script for IndieMentor AI
Checks if all required dependencies and configurations are properly set up.
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_python_version():
    """Check if Python version is 3.8+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ required. Current version:", f"{version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def check_node_version():
    """Check if Node.js version is 18+"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        version_str = result.stdout.strip().replace('v', '')
        version_major = int(version_str.split('.')[0])
        if version_major < 18:
            print(f"❌ Node.js 18+ required. Current version: {version_str}")
            return False
        print(f"✅ Node.js {version_str}")
        return True
    except FileNotFoundError:
        print("❌ Node.js not found. Please install Node.js 18+")
        return False

def check_pip_packages():
    """Check if Python packages are installed"""
    requirements_file = Path("mentor_agent/requirements.txt")
    if not requirements_file.exists():
        print("❌ requirements.txt not found in mentor_agent/")
        return False
    
    try:
        with open(requirements_file, 'r') as f:
            requirements = [line.strip().split('==')[0] for line in f if line.strip() and not line.startswith('#')]
        
        missing_packages = []
        for package in requirements:
            try:
                __import__(package.replace('-', '_'))
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            print(f"❌ Missing Python packages: {', '.join(missing_packages)}")
            print("   Run: cd mentor_agent && pip install -r requirements.txt")
            return False
        
        print("✅ Python packages installed")
        return True
    except Exception as e:
        print(f"❌ Error checking Python packages: {e}")
        return False

def check_npm_packages():
    """Check if Node.js packages are installed"""
    node_modules = Path("node_modules")
    package_json = Path("package.json")
    
    if not package_json.exists():
        print("❌ package.json not found")
        return False
    
    if not node_modules.exists():
        print("❌ node_modules not found. Run: npm install")
        return False
    
    try:
        with open(package_json, 'r') as f:
            package_data = json.load(f)
        
        dependencies = list(package_data.get('dependencies', {}).keys())
        dev_dependencies = list(package_data.get('devDependencies', {}).keys())
        all_deps = dependencies + dev_dependencies
        
        missing_deps = []
        for dep in all_deps:
            if not (node_modules / dep).exists():
                missing_deps.append(dep)
        
        if missing_deps:
            print(f"❌ Missing Node packages: {', '.join(missing_deps[:5])}{'...' if len(missing_deps) > 5 else ''}")
            print("   Run: npm install")
            return False
        
        print("✅ Node.js packages installed")
        return True
    except Exception as e:
        print(f"❌ Error checking Node packages: {e}")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists():
        if env_example.exists():
            print("❌ .env file not found. Copy .env.example to .env and configure it")
        else:
            print("❌ .env file not found. Create one with required environment variables")
        return False
    
    required_vars = [
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'GROQ_API_KEY',
        'JWT_SECRET_KEY'
    ]
    
    missing_vars = []
    try:
        with open(env_file, 'r') as f:
            env_content = f.read()
        
        for var in required_vars:
            if f"{var}=" not in env_content or f"{var}=your_" in env_content or f"{var}=" in env_content.replace(f"{var}=", f"{var}= "):
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ Missing or unconfigured environment variables: {', '.join(missing_vars)}")
            return False
        
        print("✅ Environment variables configured")
        return True
    except Exception as e:
        print(f"❌ Error reading .env file: {e}")
        return False

def check_ports():
    """Check if required ports are available"""
    import socket
    
    ports_to_check = [5173, 8001]
    busy_ports = []
    
    for port in ports_to_check:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            busy_ports.append(port)
    
    if busy_ports:
        print(f"⚠️  Ports in use: {', '.join(map(str, busy_ports))}")
        print("   This may cause conflicts when starting the application")
        return False
    
    print("✅ Required ports (5173, 8001) are available")
    return True

def main():
    """Run all validation checks"""
    print("🔍 Validating IndieMentor AI Development Environment\n")
    
    checks = [
        ("Python Version", check_python_version),
        ("Node.js Version", check_node_version),
        ("Python Packages", check_pip_packages),
        ("Node.js Packages", check_npm_packages),
        ("Environment Variables", check_env_file),
        ("Port Availability", check_ports),
    ]
    
    passed = 0
    failed = 0
    
    for name, check_func in checks:
        print(f"\n🔧 {name}:")
        if check_func():
            passed += 1
        else:
            failed += 1
    
    print(f"\n📊 Summary: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("\n🎉 Environment is ready! You can start the application with:")
        print("   npm run start")
    else:
        print("\n⚠️  Please fix the issues above before starting the application")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

# Guía Oficial: Subir a GitHub y Ejecutar Storage Guardian AI

Esta guía detalla los pasos para subir el proyecto a tu cuenta de **GitHub** y las opciones para **ejecutarlo en línea** o **en tu Mac**.

---

## ⚠️ Aclaración Importante sobre "Ejecutar en Línea" vs "En tu Mac"

* **Para limpiar tu Mac físicamente:** Como el objetivo de la app es limpiar archivos locales de tu disco (`~/.ollama`, `~/Movies/CapCut`, `/Library/...`), el backend con Node.js o Electron debe ejecutarse **localmente en tu Mac**. Un servidor remoto en la nube no tiene acceso a tu disco duro por obvias razones de seguridad del sistema operativo.
* **Para ejecutar y visualizar la interfaz en línea (Web):** Puedes desplegar el frontend y backend en plataformas en la nube como **Vercel**, **Render**, **Railway** o **Cloud Run** (o usar la URL ya activa de Google AI Studio).

---

## 🐙 Parte 1: Subir el Proyecto a tu GitHub

### Paso 1: Crear un nuevo repositorio en GitHub
1. Entra a [github.com/new](https://github.com/new).
2. Nómbralo: `storage-guardian-ai`.
3. Selecciona si quieres que sea **Público** o **Privado**.
4. **No** marques la casilla de "Add a README file" ni "Add .gitignore" (ya los tenemos creados y optimizados en el proyecto).
5. Haz clic en **Create repository**.
6. Copia la URL del repositorio (por ejemplo: `https://github.com/TU_USUARIO/storage-guardian-ai.git`).

### Paso 2: Inicializar Git y subir el código desde tu terminal
Abre tu terminal en la carpeta raíz del proyecto y ejecuta estos comandos:

```bash
# 1. Inicializar git local (si aún no está iniciado)
git init

# 2. Agregar todos los archivos al seguimiento
git add .

# 3. Crear el primer commit
git commit -m "feat: Storage Guardian AI para macOS con escáner real y launchd"

# 4. Establecer la rama principal como main
git branch -M main

# 5. Enlazar con tu repositorio remoto de GitHub (reemplaza con tu URL copiada)
git remote add origin https://github.com/TU_USUARIO/storage-guardian-ai.git

# 6. Subir el código a GitHub
git push -u origin main
```

*(Si GitHub te solicita autenticación en la terminal, puedes usar un **Personal Access Token** de GitHub o iniciar sesión con `gh auth login` del GitHub CLI).*

---

## 🌐 Parte 2: Opciones para Ejecutarlo en Línea

### Opción A: Tu enlace web ya activo en Google AI Studio (Instantáneo)
Tu aplicación ya cuenta con un despliegue en la nube listo y funcional:
* **URL en Vivo:** `https://ais-dev-l66unjhb7be2dagqw7ma2j-817447484867.us-east1.run.app`

### Opción B: Desplegar en Render (Frontend + Backend Node.js Gratis)
Ideal para alojar tanto la interfaz React como el servidor Express:
1. Regístrate en [render.com](https://render.com).
2. Haz clic en **New + > Web Service**.
3. Conecta tu repositorio de GitHub `storage-guardian-ai`.
4. Configura los parámetros:
   * **Name:** `storage-guardian-ai`
   * **Environment:** `Node`
   * **Build Command:** `npm install && npm run build`
   * **Start Command:** `npm run start`
5. Haz clic en **Deploy Web Service**. En 2 minutos tendrás una URL pública HTTPS (`https://storage-guardian-ai.onrender.com`).

### Opción C: Desplegar en Railway
1. Entra a [railway.app](https://railway.app).
2. Selecciona **New Project > Deploy from GitHub repo**.
3. Selecciona `storage-guardian-ai`. Railway detectará automáticamente el archivo `package.json` y desplegará la app.

---

## 💻 Parte 3: Cómo clonar y ejecutar en tu Mac para la limpieza semanal

Cuando quieras correrlo directamente en tu Mac para realizar el mantenimiento de tu almacenamiento:

```bash
# 1. Clonar tu repositorio desde GitHub a tu Mac
git clone https://github.com/TU_USUARIO/storage-guardian-ai.git

# 2. Entrar a la carpeta
cd storage-guardian-ai

# 3. Instalar las dependencias
npm install

# 4. Iniciar la aplicación
npm run dev
```

La app abrirá en tu navegador en `http://localhost:3000` con acceso a tu disco duro Macintosh HD para medir, auditar y limpiar tus gigabytes acumulados.

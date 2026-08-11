# ISL - Gestión de Extintores

Mismo patrón que ISL-GestionHerramientas / ISL-EPP / ISL-Izaje:
**Google Sheets (DB) → Apps Script (backend proxy) → GitHub Pages (frontend)**, con GET + `?payload=` para evitar el preflight CORS.

## 1. Google Sheets
1. Creá una planilla nueva: **ISL - Extintores DB**.
2. No hace falta crear las hojas a mano — `Code.gs` las crea solas (`Extintores`, `Inspecciones`, `Usuarios`) la primera vez que se llama a cada endpoint.
3. Opcional: cargá manualmente algunos usuarios en la hoja `Usuarios` (Nombre, Obra, Rol) para que el combo de la inspección no aparezca vacío.

## 2. Apps Script
1. En la planilla: **Extensiones → Apps Script**.
2. Borrá el contenido de `Code.gs` por defecto y pegá el `Code.gs` de esta carpeta.
3. Abrí `appsscript.json` (Ver → Mostrar archivo de manifiesto si no aparece) y reemplazá su contenido por el `appsscript.json` de esta carpeta — **el `oauthScopes` hay que agregarlo a mano, no se genera solo**.
4. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Yo (tu cuenta)**
   - Quién tiene acceso: **Cualquier usuario**
5. Copiá la URL que te da (`https://script.google.com/macros/s/XXXX/exec`).
6. **Importante:** cada vez que modifiques `Code.gs`, tenés que ir a **Implementar → Administrar implementaciones → editar (lápiz) → Nueva versión**. Si no hacés esto, los cambios no se reflejan en la URL pública aunque hayas guardado el script.

## 3. Frontend
1. En `index.html`, reemplazá:
   ```js
   const API_URL = 'PEGAR_AQUI_LA_URL_DE_TU_APPS_SCRIPT_DEPLOYADO';
   ```
   por la URL del paso 2.5.
2. Subilo a un repo de GitHub Pages, igual que hiciste con los otros (por ejemplo `isl-extintores/index.html` en un repo nuevo o dentro de uno existente).
3. Activá GitHub Pages en el repo (Settings → Pages → rama `main` / carpeta raíz).
4. Quedará accesible en algo como `mauricioemaldonado-cyber.github.io/isl-extintores/`.

## Roles y alertas
La primera vez que se abre la app en un dispositivo, pide elegir rol (se guarda en el celular, no hay login con contraseña):
- **David · Administrador**: ve las 5 pestañas, incluida **Alta**.
- **Técnico**: ve Dashboard, Inventario, Inspección y Listado, pero **no** ve la pestaña Alta — así se respeta que el alta de extintores la carga David.

El rol se puede cambiar en cualquier momento con el botón "Cambiar" en el header (útil si varios técnicos comparten un mismo celular de obra).

**Alertas de vencimiento**: apenas se abre la app, sin importar el rol ni la pestaña activa, aparece un banner debajo del header si hay extintores vencidos o por vencer (rojo = vencido, ámbar = crítico ≤15 días o próximo ≤30 días). Tocarlo lleva directo al Dashboard con el detalle. No hace falta entrar a Dashboard para enterarse.

## Qué hace cada pantalla
- **Dashboard**: contadores generales + lista de vencimientos ordenada por urgencia (vencido / crítico ≤15 días / próximo ≤30 días), tomando el mínimo entre vencimiento de recarga y de prueba hidráulica.
- **Inventario**: listado filtrable por obra y estado. Cada extintor es clickeable: abre su ficha con historial completo de inspecciones (fecha, usuario, checklist ítem por ítem, estado general y observaciones).
- **Inspección**: se busca el extintor por código (manual por ahora), se completa un checklist de 6 ítems (presión, precinto, manguera, señalización, acceso libre, golpes/corrosión) y se guarda con usuario y observaciones. Si algún ítem falla, la inspección queda marcada como "Observado" en vez de "Apto".
- **Alta**: carga de un extintor nuevo con todos los datos de vencimiento (incluye Marca).
- **Listado**: replica el formulario **R-15.10 Rev.0** que pasó David. Elegís Comitente + Obra + Fecha, se trae automáticamente el listado de extintores de esa obra (Marca, tipo/capacidad, fecha de carga, fecha de vencimiento) desde el inventario, completás manualmente "Reparación efectuada" y "Estado aceptable" por fila, y con **Descargar PDF** se genera el documento listo para imprimir y firmar (usa jsPDF + autoTable, cargados desde cdnjs).

## Próximos pasos sugeridos
- Sumar escaneo QR con cámara (librería `html5-qrcode`) para reemplazar la carga manual de código en Inspección — encaja directo en el mismo input, sin tocar el backend.
- Generar el QR de cada extintor (código → imagen) para imprimir y pegar en el equipo físico, con un link directo a `index.html?codigo=EXT-014` que precargue la inspección.
- Botón de "dar de baja" / "enviar a recarga" que dispare `updateExtintor` cambiando el campo `Estado`.

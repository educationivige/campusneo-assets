# Flujo de gestión de assets CSS/JS en GitHub para CampusNEO

## Objetivo

Centralizar los archivos de estilos y scripts del campus en un repositorio GitHub,
de forma que los cambios sean controlados y la carga en Totara sea rápida y estable.

---

## 1. Estructura del repositorio

Crear un repositorio público en GitHub llamado `campusneo-assets` con la siguiente estructura:

```
campusneo-assets/
├── css-totara-organizado.css     ← todo el CSS personalizado
├── additional-html-head.html     ← fuentes, scripts externos, estilos de tenant
└── additional-html-footer.js     ← scripts del footer
```

---

## 2. URLs de acceso según entorno

### PRE — `raw.githubusercontent.com`

Refleja los cambios de GitHub en **5-10 minutos**. Ideal para desarrollo activo.

```
https://raw.githubusercontent.com/educationivige/campusneo-assets/main/css-totara-organizado.css
https://raw.githubusercontent.com/educationivige/campusneo-assets/main/additional-html-footer.js
```

> Sin CDN, algo más lento de cargar, pero cambios casi inmediatos.

---

### PRO — jsDelivr con versión fija

CDN global, carga muy rápida. Los cambios **no se reflejan solos** — requieren subir
una nueva versión y actualizar la URL en Totara.

```
https://cdn.jsdelivr.net/gh/educationivige/campusneo-assets@v1.0/css-totara-organizado.css
https://cdn.jsdelivr.net/gh/educationivige/campusneo-assets@v1.0/additional-html-footer.js
```

> Cambiar `@v1.0` por `@v1.1`, `@v1.2`... cada vez que se publique una nueva versión.

---

## 3. Barra de entorno PRE — IMPORTANTE

La barra roja que identifica el entorno PRE **nunca debe subirse al repositorio de GitHub**,
ya que ese repo es compartido entre PRE y PRO. Si se sube, acabaría apareciendo en producción.

Debe pegarse **siempre manualmente** en el campo **"CSS personalizado"** de Totara PRE,
y nunca en PRO.

```css
/* --- Barra de entorno PRE - SIEMPRE EN CSS PERSONALIZADO --- */
body::before {
  content: "⚠️ SITIO EN PRE ⚠️";
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99999;
  background-color: #e75d5d;
  color: #ffffff;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 8px 0;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

body {
  padding-top: 38px !important;
}
```

> Este bloque NO debe estar en `css-totara-organizado.css` ni subirse a GitHub.

---

## 4. Configuración en Totara

| Campo en Totara | PRE | PRO |
|---|---|---|
| **CSS personalizado** | Barra roja PRE (pegada manualmente) | Vacío |
| **Additional HTML head** | `<link>` apuntando a raw.githubusercontent | `<link>` apuntando a jsDelivr `@vX.X` |
| **Additional HTML footer** | `<script>` apuntando a raw.githubusercontent | `<script>` apuntando a jsDelivr `@vX.X` |

### Ejemplo de etiquetas para Additional HTML head

**PRE:**
```html
<link rel="stylesheet" href="https://raw.githubusercontent.com/educationivige/campusneo-assets/main/css-totara-organizado.css">
```

**PRO:**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/educationivige/campusneo-assets@v1.0/css-totara-organizado.css">
```

### Ejemplo de etiquetas para Additional HTML footer

**PRE:**
```html
<script src="https://raw.githubusercontent.com/educationivige/campusneo-assets/main/additional-html-footer.js"></script>
```

**PRO:**
```html
<script src="https://cdn.jsdelivr.net/gh/educationivige/campusneo-assets@v1.0/additional-html-footer.js"></script>
```

---

## 5. Flujo de trabajo para publicar cambios

### Cambios en PRE

1. Editar el archivo en local
2. Hacer commit y push a la rama `main`
3. En **5-10 minutos** PRE recoge los cambios automáticamente

### Pasar cambios de PRE a PRO

1. Verificar que los cambios en PRE funcionan correctamente
2. Crear un nuevo **release/tag** en GitHub (ej. `v1.1`)
3. Actualizar la URL en el campo Additional HTML head/footer de Totara PRO cambiando la versión (`@v1.0` → `@v1.1`)
4. Los cambios son inmediatos en PRO desde ese momento

---

## 6. Tabla resumen de tiempos de caché

| URL | Caché | Uso recomendado |
|---|---|---|
| `raw.githubusercontent.com/main/...` | ~5-10 min | PRE / desarrollo |
| `cdn.jsdelivr.net/gh/...@main/...` | Hasta 24h | No recomendado |
| `cdn.jsdelivr.net/gh/...@v1.0/...` | Permanente | PRO / producción |

---

## 7. Ventajas de este flujo

- **Control de versiones** — historial de todos los cambios con git
- **Separación clara PRE/PRO** — imposible confundir entornos
- **Carga rápida en producción** — jsDelivr sirve desde CDN global
- **Un solo lugar** donde editar — sin copiar CSS entre pantallas de Totara
- **Rollback sencillo** — si algo falla en PRO, se apunta de nuevo a la versión anterior

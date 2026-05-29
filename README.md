# CampusNEO Assets

Repositorio centralizado de estilos y scripts personalizados para la plataforma **Totara** de CampusNEO.

---

## Archivos

| Archivo | Descripción |
|---|---|
| `css-totara-organizado.css` | CSS personalizado completo del campus |
| `additional-html-head.html` | Fuentes, scripts externos y estilos de tenant — se pega en el campo *Additional HTML head* de Totara |
| `additional-html-footer.js` | Scripts del footer — se referencia desde *Additional HTML footer* de Totara |

---

## Integración en Totara

### CSS — cargado desde GitHub

**PRE** (cambios visibles en ~5-10 min):
```html
<link rel="stylesheet" href="https://raw.githubusercontent.com/educationivige/campusneo-assets/main/css-totara-organizado.css">
```

**PRO** (CDN global, versión fija):
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/educationivige/campusneo-assets@v1.0/css-totara-organizado.css">
```

### HTML head y footer — pegado manualmente

El contenido de `additional-html-head.html` y `additional-html-footer.js` se copia directamente en los campos correspondientes de Totara. No se cargan desde GitHub.

---

## Flujo de trabajo

### Cambios en PRE
1. Editar el archivo en local
2. `git commit` + `git push` a `main`
3. PRE recoge los cambios automáticamente en ~5-10 minutos

### Publicar en PRO
1. Verificar que los cambios funcionan en PRE
2. Crear un nuevo tag en GitHub (`v1.1`, `v1.2`...)
3. Actualizar la URL en Totara PRO con la nueva versión

---

## Barra de entorno PRE

> La barra roja de identificación de PRE **nunca se sube a este repositorio**. Debe pegarse manualmente en el campo **CSS personalizado** de Totara PRE.

```css
body::before {
  content: "⚠️ SITIO EN PRE ⚠️";
  display: block;
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  z-index: 99999;
  background-color: #e75d5d;
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 8px 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
body { padding-top: 38px !important; }
```

---

## Caché por entorno

| URL | Caché | Uso |
|---|---|---|
| `raw.githubusercontent.com/main/...` | ~5-10 min | PRE / desarrollo |
| `cdn.jsdelivr.net/gh/...@vX.X/...` | Permanente | PRO / producción |

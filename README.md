# CampusNEO Assets

![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Totara](https://img.shields.io/badge/Totara-LMS-006975?style=for-the-badge)

Repositorio centralizado de estilos y scripts personalizados para la plataforma de aprendizaje **CampusNEO**, construida sobre Totara LMS.

---

## Estructura

```
campusneo-assets/
├── css-totara-organizado.css     # Estilos globales del campus
├── additional-html-head.html     # Fuentes, tipografías y scripts de cabecera
└── additional-html-footer.js     # Scripts del footer
```

---

## Tecnologías

- **CSS3** — variables, custom properties, responsive design
- **HTML5** — integración de fuentes web y recursos externos
- **JavaScript** — scripts de comportamiento del footer
- **jsDelivr** — CDN para distribución en producción
- **GitHub** — control de versiones y fuente de verdad

---

## Flujo PRE → PRO

El repositorio soporta dos entornos con estrategias de caché distintas:

| Entorno | Fuente | Caché |
|---|---|---|
| **PRE** | `raw.githubusercontent.com` | ~5-10 min |
| **PRO** | jsDelivr CDN con tag de versión | Permanente |

Los cambios se publican en PRE con cada `push` a `main`.
Para PRO se crea un nuevo **release** (`v1.0`, `v1.1`...) y se actualiza la URL en la plataforma.

---

## Buenas prácticas

- El CSS de producción **nunca incluye** elementos de depuración ni indicadores de entorno
- Las versiones de producción se distribuyen mediante **tags inmutables**
- El historial de git actúa como registro de auditoría de todos los cambios visuales

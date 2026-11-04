# Gestor App CFIA

Gestor web de contenidos del **App CFIA** (Colegio Federado de Ingenieros y de Arquitectos de Costa Rica). Aquí el CFIA y cada colegio miembro (CIVILES, CACR, CIEMI, CIT y CITEC) administran lo que muestra el App: trámites con WebView, sedes, anuncios, regalías, reservas y novedades, con auditoría de cada cambio.

El diseño sigue el **Libro de Marca CFIA 2026**: amarillo `#FCB429`, rojo `#B21F24`, negro `#231F20` y grises `#76777B` y `#808285`.

> **Estado:** prototipo funcional. Sirve para validar el flujo con el CFIA y los colegios. Para producción, la persistencia debe conectarse a la API del CFIA (ver «Pasar a producción»).

## Ver el gestor

El gestor no necesita compilación ni dependencias.

- **En su computadora:** abra `index.html` en el navegador.
- **En GitHub Pages:** en *Settings › Pages*, publique la rama `main` desde la carpeta raíz (`/`). La página quedará en `https://<usuario>.github.io/<repositorio>/`.
- **Un solo archivo:** `dist/gestor_app_cfia.html` incluye estilos, código, logos y datos de ejemplo.

Fuera de claude.ai, el gestor funciona en **modo demostración**: carga los datos de ejemplo de `src/datos.js` y los cambios se guardan solo en memoria hasta recargar la página.

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html` | Página principal. Carga los estilos, los datos de ejemplo y el código. |
| `src/styles.css` | Estilos: colores de marca, modo claro y oscuro, componentes y vista previa del App. |
| `src/app.js` | Lógica del gestor: módulos, formularios, validaciones, inventario, perfiles y auditoría. |
| `src/datos.js` | Datos de ejemplo para el modo demostración. |
| `datos/` | Los mismos datos de ejemplo en JSON, un archivo por colección. |
| `assets/` | Logo CFIA a color y versión sobre fondo negro. `assets/ejemplos/` tiene dos comprobantes de pago de ejemplo. |
| `dist/gestor_app_cfia.html` | Versión en un solo archivo, con los datos de ejemplo incluidos. |
| `dist/gestor_app_cfia_claude.html` | Versión publicada en claude.ai, que guarda los datos con la API de artefactos. |
| `plantilla-correo/` | Plantillas HTML de los correos: confirmación de reserva con retiro en sede y solicitud de envío por Correos de Costa Rica. |

## Módulos

| Módulo | Qué permite |
|---|---|
| Resumen | Indicadores, inventario de regalías, próximos eventos y últimos cambios. |
| Trámites y servicios | Enlaces que el App abre en WebView o en el navegador. Cada trámite indica si es para **colegiados, empresas o ambos**. |
| Sedes | Dirección, horario, teléfonos y correos de cada lugar de retiro. |
| Anuncios | Modales sobre la pantalla de Inicio del App. El Administrador CFIA elige uno, varios o todos los colegios; un usuario de colegio publica automáticamente solo para su colegio. |
| Regalías | Productos por colegio con atributos libres, inventario, período de solicitud, sedes de retiro y opción de **envío por Correos de Costa Rica**, con costo del envío y medios de pago (cuentas, bancos o SINPE Móvil) obligatorios. |
| Reservas | Registro y edición de reservas, retiro en sede o envío por Correos, con los datos de envío y el **comprobante de pago** (imagen o PDF) que sube el profesional en el App. |
| Novedades y eventos | Contenido de la sección «Novedades CFIA». Los eventos pueden tener una fecha específica o un rango de fechas. |
| Auditoría | Quién creó, modificó o eliminó cada registro, con el valor anterior y el nuevo de cada campo. |

**Exportación:** cada módulo descarga sus registros en JSON. Reservas y Auditoría también tienen **«Exportar Excel»**, que respeta los filtros y la búsqueda aplicados. La generación del Excel usa SheetJS desde cdnjs, por lo que necesita conexión a internet.

### Datos de envío por Correos de Costa Rica

Nombre completo de la persona o empresa; número de teléfono; provincia, cantón y distrito; señas exactas de la dirección de entrega o código del Apartado Postal Inteligente (API) / Locker; número de cédula (opcional, recomendado).

### Perfil de acceso (prueba)

Mientras no exista el inicio de sesión institucional, la barra lateral tiene un selector **«Perfil de acceso (prueba)»** para simular al Administrador CFIA o al gestor de cada colegio. Se guarda en el navegador de cada persona.

## Datos de ejemplo

Todos los registros de ejemplo son ficticios: se identifican con «(ejemplo)», correos `@ejemplo.com` o `@ejemplo.cr`, y comprobantes marcados como «DOCUMENTO DE EJEMPLO». Los cinco trámites con URL de servicios del CFIA y la Sede Central CFIA provienen de las historias de usuario.

## Pasar a producción

`src/app.js` usa la API de artefactos de claude.ai (`window.claude.use("db" | "user" | "assets" | "downloads")`). Para producción, reemplace esa capa por llamadas a la API del CFIA (historias HU 22 a HU 32):

- **Lectura y escritura:** funciones `boot`, `putRecord`, `deleteRecord` y `writeAudit` → `/api/gestor/v1/{modulo}`.
- **Imágenes y comprobantes:** carga en `openForm` (evento `change` de `[data-upload]`) → `/api/gestor/v1/imagenes`.
- **Usuarios y perfiles:** `S.me`, `perfil()` y `esAdmin()` → inicio de sesión institucional (SSO) con roles (HU 8).
- **Reglas de negocio:** inventario, límite por profesional y auditoría deben validarse también en el servidor (HU 18, HU 19 y HU 30).

## Modelo de datos

Colecciones: `tramites`, `sedes`, `anuncios`, `regalias`, `reservas`, `novedades` y `auditoria`. Cada documento guarda los campos definidos en `MODS[...].fields` de `src/app.js`, más `creadoEn`, `creadoPor`, `actualizadoEn` y `actualizadoPor`.

Cada movimiento de `auditoria` registra `fecha`, `actorId`, `modulo`, `registroId`, `registroNombre`, `accion` (`crear`, `modificar` o `eliminar`), `cambios` (lista de `{campo, etiqueta, antes, despues}`) y `nota`.

## Tipografía

El manual de marca define Noir Pro (títulos) y Myriad Pro (cuerpo). Como no se incluyen licencias web, se usan Poppins y Source Sans 3 de Google Fonts. Si el CFIA tiene las licencias web, basta con declararlas con `@font-face`: ya están primeras en las variables `--f-tit` y `--f-txt` de `src/styles.css`.

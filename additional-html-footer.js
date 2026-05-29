document.addEventListener('DOMContentLoaded', function() {
    /// Configuración visible y fácil de modificar
    const config = {
        // Rutas base donde se aplicarán las funciones
        pathPatterns: [
            '/dashboard/', // Ruta dashboard sin parámetros adicionales
            '/dashboard/index.php', // Ruta index.php sin parámetros
            '/dashboard/?id=', // Ruta dashboard con ID (patrón original)
            '/dashboard/index.php?id=' // Ruta index.php con ID
        ],

        // Configuración para ocultar Current Learning que no tienen cursos
        currentLearningVaciosConfig: {
            enabledForIds: ['9'], // IDs específicos donde se activa la función
            enabledForAllPatterns: true,
            instancias: ['inst233', 'inst8272'], // Instancias a verificar
        },

        // Configuración para Iconos check PNTs
        completionIconConfig: {
            enabledForIds: ['9', '1'], // IDs específicos donde se activa la función
            instancias: ['inst230', 'inst215', 'inst10236'], // Instancias donde buscar íconos
            enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
        },

        // Configuración para reemplazo de íconos informes PNTs
        iconReplacerConfig: {
            enabledForIds: ['9', '1'], // IDs específicos donde se activa la función
            enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
            instancias: ['inst230', 'inst215', 'inst10236'], // Instancias donde buscar íconos
            newIconUrl: '/pluginfile.php/1/local_uploadfiles/additionalimages/0/pnt-white.svg', // URL del ícono estándar
            lfeIconUrl: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/pnt-lfe.svg' // URL del ícono para LFE
        },

        // Configuración para Etiquetas Obligatorio/Mandatory
        mandatoryLabelConfig: {
            enabledForIds: ['9', '1'], // IDs específicos donde se activa la función
            enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
            instancias: ['inst212', 'inst226'], // Instancias de los bloques para etiquetas
        },

        // Configuración para procesar tabla de estados
        tablaEstadosConfig: {
            enabledForIds: ['10', '27'], // IDs específicos donde se activa la función
            enabledForAllPatterns: true, // Si es true, se activará para todas las rutas sin importar el ID
            instancias: ['inst277', 'inst9478'] // Instancias de la tabla de estados (añadir más IDs aquí)
        },

        // Configuración para acordeonVisorLFE y suma de puntos
        acordeonConfig: {
            enabledForIds: ['10', '27'], // IDs específicos donde se activa la función
            enabledForAllPatterns: false, // Si es true, se activará para todas las rutas sin importar el ID
            instancias: ['inst278', 'inst279', 'inst280', 'inst281', 'inst9479', 'inst9480', 'inst9481', 'inst9482'], // Instancias de los bloques para convertir en acordeones
            // Mapeo de dashboard ID → instancia del bloque de puntuación máxima
            instanciaPuntuacionMaxima: {
                '10': 'inst11027',
                '27': 'inst9485'
            }
        },

        // Configuración para reemplazo de caras en cuestionarios de satisfacción
        feedbackFacesConfig: {
            enabledForPaths: ['/feedback'], // Rutas exclusivas para esta función
            enabledForAllPatterns: false, // No usar las rutas generales
            titlePatterns: ['cuestionario satisfacción', 'dotazník spokojenosti', 'satisfaction questionnaire', 'questionario di gradimento', 'questionário de satisfação', 'utvärderingsformulär'],
            faceImages: {
                1: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-1.svg',
                2: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-2.svg',
                3: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-3.svg',
                4: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-4.svg',
                5: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/cuestionario-5.svg'
            }
        },

        // Configuración para el plan de Ciberseguridad 2026
        // Lee la tabla de un mod/page externo y crea un bloque-tile clonando inst9792
        // Activo SOLO en /totara/dashboard/index.php?id=28
        cyberPlanConfig: {
            enabledForIds: ['28'],
            enabledForAllPatterns: false,
            sourceUrl: 'https://ivirmacampus.com/mod/page/view.php?id=21135',
            tableId: 'ivirma-plan-ciberseguridad-2026',
            originalBlockId: 'inst9792',     // Bloque cuya estructura clonamos
            newBlockId: 'inst-cyber-2026',   // ID del nuevo bloque inyectado
            blockTitle: 'Ciberseguridad',
            tileComponent: 'Ciberseguridad'
        },

        // Configuración común para estilos
        stylesConfig: {
            icons: {
                completedIcon: '/pluginfile.php/1/local_uploadfiles/additionalimages/0/Completed.svg', //check pnts completados
                plusCircleIcon: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/plus-circle.svg', //colapsar acordeon visor
                minusCircleIcon: 'https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/minus-circle.svg' //expandir acordeon visor
            },
            animations: {
                duration: '0.4s',
                timingFunction: 'ease-in-out'
            }
        },

        // Configuración para logging
        debug: true // Activar/desactivar mensajes de depuración
    };

    // Utilidades comunes
    const Utils = {
        /**
         * Sistema de logging centralizado
         */
        log: function(component, message, isError = false) {
            if (!config.debug && !isError) return;
            const prefix = `[${component}]`;
            if (isError) {
                console.error(`${prefix} ${message}`);
            } else {
                console.log(`${prefix} ${message}`);
            }
        },

        /**
         * Obtiene un parámetro de la URL
         */
        getQueryParam: function(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        },

        /**
         * Función debounce para optimizar eventos frecuentes
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Espera a que aparezca un elemento en el DOM con promesa
         */
        waitForElement: function(selector, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }

                const observer = new MutationObserver((mutations, obs) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        obs.disconnect();
                        resolve(element);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                }, timeout);
            });
        },

        /**
         * Versión legacy de waitForElement con callback para compatibilidad
         */
        waitForElementLegacy: function(selector, callback, maxAttempts = 20, interval = 200) {
            let attempts = 0;
            const checkElement = setInterval(() => {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        clearInterval(checkElement);
                        callback(element);
                        Utils.log('Optimizado', `Elemento encontrado: ${selector}`);
                    } else if (++attempts >= maxAttempts) {
                        clearInterval(checkElement);
                        Utils.log('Optimizado', `Elemento no encontrado después de ${maxAttempts} intentos: ${selector}`);

                        // Si es una tabla que no se encuentra, verificar contra todas las instancias de tablaEstadosConfig
                        if (selector.includes('table')) {
                            const instanciasEstados = config.tablaEstadosConfig.instancias || [];
                            const coincideConEstados = instanciasEstados.some(inst => selector.includes(inst));
                            if (coincideConEstados) {
                                Utils.log('Optimizado', `Ejecutando procesarTablaEstados sin tabla encontrada`);
                                DashboardFunctions.procesarTablaEstados();
                            }
                        }
                    }
                } catch (error) {
                    clearInterval(checkElement);
                    Utils.log('Optimizado', `Error esperando elemento ${selector}: ${error.message}`, true);
                }
            }, interval);
        }
    };

    const URLMatcher = {
        /**
         * Verifica si la URL actual coincide con los patrones configurados
         * y si el ID (cuando existe) está en la lista de permitidos
         */
        isUrlPatternMatched: function(configSection) {
            const currentPath = window.location.pathname;
            const currentUrl = currentPath + window.location.search;
            const id = Utils.getQueryParam('id');

            // Verificar si la URL coincide con alguno de los patrones
            const patternMatched = config.pathPatterns.some(pattern => {
                // Si el patrón termina con "id=", verificamos que la URL incluya esa parte con algún valor
                if (pattern.endsWith('id=')) {
                    return currentUrl.includes(pattern) && id !== null;
                }
                // Si no, verificamos que la URL comience con el patrón
                return currentPath.includes(pattern) || currentUrl.includes(pattern);
            });

            if (!patternMatched) {
                return false;
            }

            // Si la configuración indica que se activa para todos los patrones, retornar true
            if (configSection.enabledForAllPatterns) {
                // Nueva lógica:
                // Solo retornar true si no hay ID en la URL o si configSection no tiene IDs específicos
                if (id === null || !configSection.enabledForIds || configSection.enabledForIds.length === 0) {
                    return true;
                }
                // Si hay ID y configSection tiene IDs específicos, verificar si la ID está permitida
                return configSection.enabledForIds.includes(id);
            }

            // Si no hay ID pero la configuración requiere IDs específicos, retornar false
            if (!id && configSection.enabledForIds && configSection.enabledForIds.length > 0) {
                return false;
            }

            // Verificar si el ID está en la lista de permitidos
            return id && configSection.enabledForIds && configSection.enabledForIds.includes(id);
        }
    };

    const MandatoryLabelsModule = {
        observers: new Map(),

        /**
         * Inicializa las funciones para las etiquetas obligatorias en múltiples idiomas
         */
        init: function() {
            if (!URLMatcher.isUrlPatternMatched(config.mandatoryLabelConfig)) {
                Utils.log('Etiquetas', `URL o ID no permitido para añadir etiquetas obligatorias`);
                return;
            }
            Utils.log('Etiquetas', `Patrón de URL permitido encontrado, procesando etiquetas obligatorias...`);

            // Procesar cada instancia
            config.mandatoryLabelConfig.instancias.forEach(containerId => {
                Utils.waitForElementLegacy(`#${containerId}`, () => {
                    this.processContainer(containerId);
                    this.observeContainer(containerId);
                });
            });
        },

        /**
         * Procesa un contenedor específico
         */
        processContainer: function(containerId) {
            const container = document.getElementById(containerId);
            if (!container) {
                Utils.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
                return;
            }

            const listItems = container.querySelectorAll("li.block_current_learningas-tile");
            Utils.log('Etiquetas', `Se encontraron ${listItems.length} elementos li en ${containerId}.`);

            listItems.forEach(li => this.processListItem(li));
        },

        /**
         * Procesa un elemento de lista individual
         */
        processListItem: function(li) {
            const mandatoryDiv = li.querySelector("div.block_current_learningas-customfield");
            if (!mandatoryDiv) return;

            // Lista de términos obligatorios en diferentes idiomas
            const mandatoryTerms = {
                'es': 'Obligatorio',
                'en': 'Mandatory',
                'pt': 'Obrigatório',
                'cs': 'Povinné',
                'it': 'Obbligatorio',
                'sv': 'Kursk'
            };

            // Buscar coincidencia con cualquiera de los términos obligatorios
            const matchedTerm = Object.entries(mandatoryTerms).find(([lang, term]) =>
                mandatoryDiv.textContent.includes(term));

            if (matchedTerm && !li.querySelector(".etiqueta-obligatorio")) {
                const [lang, term] = matchedTerm;
                const span = document.createElement("span");
                span.classList.add("etiqueta-obligatorio");
                span.textContent = term;
                li.appendChild(span);
                Utils.log('Etiquetas', `Etiqueta añadida (${lang}: ${term}) en ${li.closest('[id]')?.id || 'contenedor'}.`);
            }

            const customFieldsDiv = li.querySelector("div.block_current_learningas-customfields");
            if (customFieldsDiv) {
                customFieldsDiv.style.display = "none";
            }
        },

        /**
         * Observa los cambios en el contenedor para actualizar las etiquetas obligatorias
         */
        observeContainer: function(containerId) {
            const targetNode = document.getElementById(containerId);
            if (!targetNode) {
                Utils.log('Etiquetas', `No se encontró el contenedor ${containerId}.`, true);
                return;
            }

            // Verificar si ya hay un observador para este contenedor
            if (this.observers.has(containerId)) return;

            Utils.log('Etiquetas', `Observador activado en ${containerId}.`);

            const debouncedProcess = Utils.debounce(() => {
                Utils.log('Etiquetas', `Cambios detectados en ${containerId}, verificando etiquetas...`);
                this.processContainer(containerId);
            }, 300);

            const observer = new MutationObserver(debouncedProcess);
            observer.observe(targetNode, {
                childList: true,
                subtree: true
            });

            this.observers.set(containerId, observer);
        },

        /**
         * Limpia los observadores
         */
        destroy: function() {
            this.observers.forEach((observer, containerId) => {
                observer.disconnect();
                Utils.log('Etiquetas', `Observer desconectado para ${containerId}`);
            });
            this.observers.clear();
        }
    };

    // ============================================================
    // MÓDULO PLAN CIBERSEGURIDAD 2026
    // Clona inst9792 + inyecta tiles desde mod/page/view.php?id=21135
    // ============================================================
    const CyberPlanModule = {
        isInitialized: false,
        keydownHandler: null,

        /**
         * Inicialización (asíncrona): hace fetch al mod/page con la tabla,
         * crea el bloque y renderiza tiles. Si la instancia original no existe,
         * se autodescarta silenciosamente.
         */
        init: async function() {
            if (!URLMatcher.isUrlPatternMatched(config.cyberPlanConfig)) {
                Utils.log('CyberPlan', `URL o ID no permitido para plan de ciberseguridad`);
                return;
            }

            // Existencia del bloque original es la verdadera condición de activación
            const original = document.getElementById(config.cyberPlanConfig.originalBlockId);
            if (!original) {
                Utils.log('CyberPlan', `Bloque original ${config.cyberPlanConfig.originalBlockId} no encontrado en esta página, omitiendo`);
                return;
            }

            // Evitar doble inicialización
            if (this.isInitialized || document.getElementById(config.cyberPlanConfig.newBlockId)) {
                Utils.log('CyberPlan', `Ya inicializado, omitiendo`);
                return;
            }

            Utils.log('CyberPlan', `Iniciando renderizado del plan de ciberseguridad...`, true);

            try {
                const bloques = await this.fetchPlan();
                const block = this.createBlock();
                if (!block) {
                    Utils.log('CyberPlan', `No se pudo crear el bloque destino`, true);
                    return;
                }
                this.renderTiles(block, bloques);
                this.isInitialized = true;
                Utils.log('CyberPlan', `Plan renderizado con ${bloques.length} bloques`, true);
            } catch (err) {
                Utils.log('CyberPlan', `Error al renderizar: ${err.message}`, true);
            }
        },

        /**
         * Descarga la página fuente y parsea la tabla de bloques
         */
        fetchPlan: async function() {
            const cfg = config.cyberPlanConfig;
            const res = await fetch(cfg.sourceUrl, { credentials: 'same-origin' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const html = await res.text();
            const doc  = new DOMParser().parseFromString(html, 'text/html');
            const tbl  = doc.querySelector('#' + cfg.tableId);
            if (!tbl) throw new Error(`Tabla #${cfg.tableId} no encontrada`);

            return Array.from(tbl.querySelectorAll('tbody tr')).map(tr => {
                const get = sel => (tr.querySelector(sel)?.textContent || '').trim();

                const duracionRaw = get('.col-duracion');
                const mDur = duracionRaw.match(/^(\d+)\s*min/i);
                const duracionMin = mDur ? mDur[1] : '';

                const imagen = (tr.querySelector('.col-imagen a')?.getAttribute('href') || '').trim();

                const contenidos = Array.from(tr.querySelectorAll('.col-contenidos li')).map(li => {
                    const a = li.querySelector('a');
                    return {
                        titulo:  a ? a.textContent.trim() : '',
                        url:     a ? a.href : '#',
                        minutos: li.dataset.minutos || ''
                    };
                });

                return {
                    num:        tr.dataset.bloqueNum,
                    roman:      tr.dataset.bloqueRoman,
                    titulo:     get('.col-titulo'),
                    imagen,
                    fechas:     get('.col-fechas'),
                    gracia:     get('.col-gracia'),
                    objetivo:   get('.col-objetivo'),
                    duracion:   duracionRaw,
                    duracionMin,
                    contenidos
                };
            });
        },

        /**
         * Crea el nuevo bloque clonando la estructura del original (inst9792)
         */
        createBlock: function() {
            const cfg = config.cyberPlanConfig;
            const existing = document.getElementById(cfg.newBlockId);
            if (existing) return existing;

            const original = document.getElementById(cfg.originalBlockId);
            if (!original) return null;

            const wrap = document.createElement('div');
            wrap.id = cfg.newBlockId;
            wrap.className = 'block_current_learningas block chromeless';
            wrap.setAttribute('role', 'region');
            wrap.setAttribute('data-block', 'current_learningas');
            wrap.innerHTML = `
                <div class="header block-header">
                    <div class="title block-title" data-dock-title="${cfg.blockTitle}">
                        <div class="block_action" data-collapsible="1"></div>
                        <h2>${cfg.blockTitle}</h2>
                    </div>
                </div>
                <div class="content block-content">
                    <div class="block_current_learningas-tiles" data-loading="false">
                        <ul data-items-per-row="3"></ul>
                    </div>
                </div>
            `;

            original.parentNode.insertBefore(wrap, original.nextSibling);
            return wrap;
        },

        /**
         * Renderiza las tiles dentro del nuevo bloque
         */
        renderTiles: function(block, bloques) {
            const cfg = config.cyberPlanConfig;
            const ul = block.querySelector('ul');
            ul.innerHTML = '';

            bloques.forEach((b, idx) => {
                const li = document.createElement('li');
                li.className = 'block_current_learningas-tile ivirma-cyber-tile';
                li.title = b.titulo;
                li.dataset.bloqueIdx = idx;

                const bgStyle = b.imagen ? `style="background-image: url('${b.imagen}')"` : '';

                li.innerHTML = `
                    <div class="block_current_learningas-tile__image">
                        <div class="block_current_learningas-tile__image_ratio">
                            <div class="block_current_learningas-tile__image_ratio_img" ${bgStyle}></div>
                        </div>
                    </div>
                    <div class="block_current_learningas-tile__maincontent">
                        <div class="ivirma-bloque-label"></div>
                        <span class="block_current_learningas-tile__content_component">${cfg.tileComponent}</span>
                        <a href="#" class="block_current_learningas-tile__link">
                            <h3 class="block_current_learningas-tile__link_title">${b.titulo}</h3>
                        </a>
                    </div>
                `;

                li.querySelector('.block_current_learningas-tile__link')
                  .addEventListener('click', e => { e.preventDefault(); this.openModal(b); });

                ul.appendChild(li);
            });
        },

        /**
         * Crea (una sola vez) la estructura del modal en document.body
         */
        ensureModal: function() {
            let modal = document.getElementById('ivirma-cyber-modal');
            if (modal) return modal;

            modal = document.createElement('div');
            modal.id = 'ivirma-cyber-modal';
            modal.className = 'ivirma-cyber-modal';
            modal.innerHTML = `
                <div class="ivirma-cyber-modal__backdrop"></div>
                <div class="ivirma-cyber-modal__dialog" role="dialog" aria-modal="true">
                    <div class="ivirma-cyber-modal__hero">
                        <button class="ivirma-cyber-modal__close" aria-label="Cerrar">×</button>
                        <div class="ivirma-cyber-modal__hero-text">
                            <h2 class="ivirma-cyber-modal__title"></h2>
                            <p class="ivirma-cyber-modal__subtitle">Ciberseguridad</p>
                            <p class="ivirma-cyber-modal__bloque"></p>
                        </div>
                        <div class="ivirma-cyber-modal__duration">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <circle cx="12" cy="12" r="9"/>
                                <path d="M12 7v5l3 2" stroke-linecap="round"/>
                            </svg>
                            <div>
                                <div class="ivirma-cyber-modal__duration-label">Duración</div>
                                <div class="ivirma-cyber-modal__duration-value"></div>
                            </div>
                        </div>
                    </div>
                    <div class="ivirma-cyber-modal__body">
                        <div class="ivirma-cyber-modal__col-left">
                            <h3>Objetivo</h3>
                            <p class="ivirma-cyber-modal__objetivo"></p>
                            <h3>Periodo de gracia</h3>
                            <p class="ivirma-cyber-modal__gracia"></p>
                            <h3>Fechas formación</h3>
                            <p class="ivirma-cyber-modal__fechas"></p>
                        </div>
                        <div class="ivirma-cyber-modal__col-right">
                            <h3>Contenidos</h3>
                            <div class="ivirma-cyber-modal__contenidos"></div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('.ivirma-cyber-modal__backdrop').addEventListener('click', () => this.closeModal());
            modal.querySelector('.ivirma-cyber-modal__close').addEventListener('click', () => this.closeModal());

            // Listener Escape (sólo se registra una vez gracias a esta guarda)
            if (!this.keydownHandler) {
                this.keydownHandler = (e) => {
                    if (e.key === 'Escape' && modal.classList.contains('is-open')) this.closeModal();
                };
                document.addEventListener('keydown', this.keydownHandler);
            }

            return modal;
        },

        /**
         * Abre el modal con la información del bloque pasado
         */
        openModal: function(b) {
            const m = this.ensureModal();
            m.querySelector('.ivirma-cyber-modal__title').textContent          = b.titulo;
            m.querySelector('.ivirma-cyber-modal__bloque').textContent         = 'BLOQUE ' + b.roman;
            m.querySelector('.ivirma-cyber-modal__duration-value').textContent = b.duracionMin ? b.duracionMin + ' minutos' : b.duracion;
            m.querySelector('.ivirma-cyber-modal__objetivo').textContent       = b.objetivo;
            m.querySelector('.ivirma-cyber-modal__gracia').textContent         = b.gracia;
            m.querySelector('.ivirma-cyber-modal__fechas').textContent         = b.fechas;

            // Imagen del hero del modal (misma que la tile, si existe)
            const hero = m.querySelector('.ivirma-cyber-modal__hero');
            if (b.imagen) {
                hero.style.backgroundImage = `url('${b.imagen}')`;
                hero.classList.add('has-bg');
            } else {
                hero.style.backgroundImage = '';
                hero.classList.remove('has-bg');
            }

            const cont = m.querySelector('.ivirma-cyber-modal__contenidos');
            cont.innerHTML = '';
            b.contenidos.forEach(c => {
                const a = document.createElement('a');
                a.className = 'ivirma-cyber-modal__pill';
                a.href = c.url;
                a.target = '_blank';
                a.rel = 'noopener';
                const min = c.minutos ? ` (${c.minutos} min)` : '';
                a.innerHTML = `
                    <span class="ivirma-cyber-modal__pill-text">${c.titulo}${min}</span>
                    <span class="ivirma-cyber-modal__pill-arrow">↗</span>
                `;
                cont.appendChild(a);
            });

            m.classList.add('is-open');
            document.body.classList.add('ivirma-cyber-modal-open');
        },

        /**
         * Cierra el modal
         */
        closeModal: function() {
            const m = document.getElementById('ivirma-cyber-modal');
            if (!m) return;
            m.classList.remove('is-open');
            document.body.classList.remove('ivirma-cyber-modal-open');
        },

        /**
         * Limpia recursos
         */
        destroy: function() {
            if (this.keydownHandler) {
                document.removeEventListener('keydown', this.keydownHandler);
                this.keydownHandler = null;
            }
        }
    };

    const ScoreManager = {
        puntuacionCalculada: 0,
        contenidoEncontrado: false,

        /**
         * Calcula la puntuación total de las tablas
         */
        calcularPuntuacionTotal: function() {
            let sumaPuntuacionTotal = 0;
            let contenidoEncontrado = false;

            // Procesar cada div configurado
            config.acordeonConfig.instancias.forEach(divId => {
                const div = document.getElementById(divId);
                if (!div) return;

                // Buscar tablas dentro del div
                const tablas = div.querySelectorAll('table');
                if (tablas.length > 0) {
                    contenidoEncontrado = true;
                }

                sumaPuntuacionTotal += this.procesarTablasDiv(div, tablas);
            });

            this.puntuacionCalculada = sumaPuntuacionTotal;
            this.contenidoEncontrado = contenidoEncontrado;

            Utils.log('Puntuación', `Puntuación total calculada: ${sumaPuntuacionTotal}`, true);
            Utils.log('Puntuación', `¿Se encontró contenido? ${contenidoEncontrado ? 'Sí' : 'No'}`, true);

            return sumaPuntuacionTotal;
        },

        /**
         * Procesa las tablas de un div específico
         */
        procesarTablasDiv: function(div, tablas) {
            let sumaPuntuacionDiv = 0;

            tablas.forEach(tabla => {
                // Intentar con las clases específicas conocidas
                let puntosEncontrados = false;

                // 1. Probar con las clases específicas conocidas
                const celdasConocidas = tabla.querySelectorAll('td.evidence_custom_field_13, td.course_custom_field_10');
                celdasConocidas.forEach(celda => {
                    const numero = this.extraerNumero(celda.textContent.trim());
                    if (!isNaN(numero)) {
                        sumaPuntuacionDiv += numero;
                        puntosEncontrados = true;
                        Utils.log('Puntuación', `Valor encontrado (clase conocida): ${numero}`);
                    }
                });

                // 2. Si no se encontraron puntos por clases específicas
                if (!puntosEncontrados) {
                    sumaPuntuacionDiv += this.buscarPuntuacionPorColumnas(tabla);
                }
            });

            return sumaPuntuacionDiv;
        },

        /**
         * Busca puntuaciones por columnas identificadas
         */
        buscarPuntuacionPorColumnas: function(tabla) {
            let sumaPuntuacion = 0;
            const columnasPuntuacion = this.identificarColumnasPuntuacion(tabla);

            if (columnasPuntuacion.length > 0) {
                const filas = tabla.querySelectorAll('tbody tr');
                filas.forEach(fila => {
                    const celdas = fila.querySelectorAll('td');
                    columnasPuntuacion.forEach(indiceColumna => {
                        if (celdas[indiceColumna]) {
                            const numero = this.extraerNumero(celdas[indiceColumna].textContent.trim());
                            if (!isNaN(numero)) {
                                sumaPuntuacion += numero;
                                Utils.log('Puntuación', `Valor encontrado (columna identificada): ${numero}`);
                            }
                        }
                    });
                });
            } else {
                // 3. Búsqueda en última columna numérica
                sumaPuntuacion += this.buscarEnUltimaColumnaNumerica(tabla);
            }

            return sumaPuntuacion;
        },

        /**
         * Identifica columnas de puntuación por encabezados
         */
        identificarColumnasPuntuacion: function(tabla) {
            const encabezados = tabla.querySelectorAll('th');
            const columnasPuntuacion = [];

            encabezados.forEach((encabezado, indice) => {
                const textoEncabezado = encabezado.textContent.trim().toLowerCase();
                if (this.esCabeceraDeCalificacion(textoEncabezado)) {
                    columnasPuntuacion.push(indice);
                    Utils.log('Puntuación', `Columna de puntuación identificada: ${indice} (${encabezado.textContent})`);
                }
            });

            return columnasPuntuacion;
        },

        /**
         * Verifica si un encabezado es de puntuación
         */
        esCabeceraDeCalificacion: function(texto) {
            const palabrasClave = [
                'punto', 'puntos', 'lfe', 'certificación', 'calificación', 'puntuación', 'score', 'points'
            ];
            return palabrasClave.some(palabra => texto.includes(palabra));
        },

        /**
         * Busca en la última columna numérica
         */
        buscarEnUltimaColumnaNumerica: function(tabla) {
            let sumaPuntuacion = 0;
            const filas = tabla.querySelectorAll('tbody tr');

            filas.forEach(fila => {
                const celdas = Array.from(fila.querySelectorAll('td'));
                // Buscar de derecha a izquierda
                for (let i = celdas.length - 1; i >= 0; i--) {
                    const texto = celdas[i].textContent.trim();
                    if (/^\d+(\.\d+)?$/.test(texto)) {
                        const numero = parseFloat(texto);
                        if (!isNaN(numero)) {
                            sumaPuntuacion += numero;
                            Utils.log('Puntuación', `Valor numérico encontrado (última columna): ${numero}`);
                            break;
                        }
                    }
                }
            });

            return sumaPuntuacion;
        },

        /**
         * Extrae número de texto
         */
        extraerNumero: function(texto) {
            const numeroMatch = texto.match(/\d+(\.\d+)?/);
            return numeroMatch ? parseFloat(numeroMatch[0]) : NaN;
        },

        /**
         * Actualiza los spans de puntuación
         */
        actualizarSpansPuntuacion: function() {
            const puntuacionMaxima = this.obtenerPuntuacionMaxima();
            const spans = document.querySelectorAll('.lfe-visor-puntuacion');

            Utils.log('Puntuación', `Actualizando ${spans.length} spans con puntuación ${this.puntuacionCalculada}/${puntuacionMaxima}`, true);

            spans.forEach((span, index) => {
                span.textContent = `${this.puntuacionCalculada}/${puntuacionMaxima}`;
                span.classList.add('lfe-actualizado');
                Utils.log('Puntuación', `Span ${index} actualizado a: ${span.textContent}`, true);
            });
        },

        /**
         * Obtiene la instancia de puntuación máxima según el dashboard actual
         */
        obtenerInstanciaPuntuacionMaxima: function() {
            const dashboardId = Utils.getQueryParam('id');
            const mapeo = config.acordeonConfig.instanciaPuntuacionMaxima || {};

            // Buscar en el mapeo según el ID del dashboard
            if (dashboardId && mapeo[dashboardId]) {
                return mapeo[dashboardId];
            }

            // Fallback: usar el primer valor del mapeo
            const valores = Object.values(mapeo);
            return valores.length > 0 ? valores[0] : 'inst8008';
        },

        /**
         * Obtiene la puntuación máxima del div correspondiente al dashboard actual
         */
        obtenerPuntuacionMaxima: function() {
    const instanciaId = this.obtenerInstanciaPuntuacionMaxima();
    Utils.log('Puntuación', `Usando instancia ${instanciaId} para puntuación máxima (dashboard: ${Utils.getQueryParam('id')})`);

    const divContenedor = document.getElementById(instanciaId);
    if (!divContenedor) {
        Utils.log('Puntuación', `No se encontró el div con ID ${instanciaId}`, true);
        return 'YYYY';
    }

    // Buscar en td.course_custom_field_10 dentro de la tabla del bloque
    const celdaPuntos = divContenedor.querySelector('td.course_custom_field_10');
    if (celdaPuntos) {
        const texto = celdaPuntos.textContent.trim();
        const numeroMatch = texto.match(/\d+/);
        if (numeroMatch) {
            const puntuacionMaxima = numeroMatch[0];
            Utils.log('Puntuación', `Puntuación máxima encontrada en tabla: ${puntuacionMaxima}`);
            return puntuacionMaxima;
        } else {
            Utils.log('Puntuación', `No se encontró un número en la celda course_custom_field_10: "${texto}"`, true);
        }
    } else {
        Utils.log('Puntuación', `No se encontró td.course_custom_field_10 dentro de ${instanciaId}`, true);
    }

    // Fallback: método anterior con block_current_learningas-customfields
    const divCustomFields = divContenedor.querySelector('.block_current_learningas-customfields');
    if (divCustomFields) {
        const texto = divCustomFields.textContent.trim();
        const numeroMatch = texto.match(/\d+/);
        if (numeroMatch) {
            const puntuacionMaxima = numeroMatch[0];
            Utils.log('Puntuación', `Puntuación máxima encontrada (fallback): ${puntuacionMaxima}`);
            return puntuacionMaxima;
        }
    }

    Utils.log('Puntuación', `No se pudo obtener la puntuación máxima de ninguna fuente`, true);
    return 'YYYY';
}
};







    const DashboardFunctions = {
        /**
         * Reemplaza números por imágenes de caras en cuestionarios de satisfacción
         */
        replaceFeedbackNumbers: function() {
            const currentPath = window.location.pathname;
            const validPath = config.feedbackFacesConfig.enabledForPaths.some(path => currentPath.includes(path));

            if (!validPath) {
                Utils.log('Feedback', `URL no corresponde a ruta de feedback: ${currentPath}`);
                return;
            }

            Utils.log('Feedback', `Ruta de feedback detectada, buscando cuestionarios de satisfacción...`);

            if (!this.validarTituloFeedback()) return;

            this.configurarReemplazoCaras();
            this.configurarObservadorFormulario();
        },

        /**
         * Valida que exista un título de cuestionario válido
         */
        validarTituloFeedback: function() {
            const h2Elements = document.querySelectorAll('h2');
            const validTitles = config.feedbackFacesConfig.titlePatterns;

            for (const h2 of h2Elements) {
                const h2TextLower = h2.textContent.toLowerCase().trim();
                if (validTitles.some(title => h2TextLower.includes(title))) {
                    Utils.log('Feedback', `Título válido encontrado: "${h2.textContent}"`);
                    return true;
                }
            }

            Utils.log('Feedback', `No se encontró un título de cuestionario válido`);
            return false;
        },

        /**
         * Configura el reemplazo de números por caras
         */
        configurarReemplazoCaras: function() {
            const replaceNumbersWithFaces = () => {
                const weightSpans = document.querySelectorAll('span.weight');
                let replacedCount = 0;

                weightSpans.forEach(span => {
                    const match = span.textContent.match(/\((\d+)\)/);
                    if (match) {
                        const number = parseInt(match[1]);
                        if (config.feedbackFacesConfig.faceImages[number]) {
                            const img = document.createElement('img');
                            img.src = config.feedbackFacesConfig.faceImages[number];
                            img.alt = `Opción ${number}`;
                            img.style.cssText = 'width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;';

                            span.textContent = '';
                            span.appendChild(img);
                            replacedCount++;
                        }
                    }
                });

                Utils.log('Feedback', `Se reemplazaron ${replacedCount} números por imágenes`);
            };

            replaceNumbersWithFaces();
        },

        /**
         * Configura el observador del formulario de feedback
         */
        configurarObservadorFormulario: function() {
            const form = document.getElementById('feedback_complete_form');
            if (!form) {
                Utils.log('Feedback', `No se encontró el formulario de feedback`, true);
                return;
            }

            const debouncedReplace = Utils.debounce(() => {
                Utils.log('Feedback', `Cambios detectados en el formulario, actualizando imágenes...`);
                this.configurarReemplazoCaras();
            }, 300);

            const observer = new MutationObserver(debouncedReplace);
            observer.observe(form, {
                childList: true,
                subtree: true
            });

            Utils.log('Feedback', `Observador configurado en el formulario de feedback`);
        },

        /**
         * Procesa la tabla de estados reemplazando Yes/Si por ✓ y No por –
         * Muestra u oculta divs según el estado de completitud
         * ACTUALIZADO: Ahora soporta múltiples instancias
         */
        procesarTablaEstados: function() {
            try {
                Utils.log('Estados', `Iniciando procesarTablaEstados - v4.0 (multi-instancia)`, true);

                if (!URLMatcher.isUrlPatternMatched(config.tablaEstadosConfig)) {
                    Utils.log('Estados', `URL o ID no permitido para procesar tabla de estados`);
                    return;
                }

                // Obtener array de instancias (compatible con formato antiguo y nuevo)
                const instancias = Array.isArray(config.tablaEstadosConfig.instancias)
                    ? config.tablaEstadosConfig.instancias
                    : [config.tablaEstadosConfig.instancias || config.tablaEstadosConfig.instancia];

                Utils.log('Estados', `Procesando ${instancias.length} instancia(s): ${instancias.join(', ')}`, true);

                // Acumular estado global de todas las instancias
                let hayAlgunaTablaConDatos = false;
                let todosCompletadosGlobal = true;

                instancias.forEach(idBloque => {
                    const contenedor = this.obtenerContenedorEstados(idBloque);
                    if (!contenedor) return;

                    const { noHayDatos, tabla } = this.analizarContenidoTabla(contenedor);

                    if (noHayDatos) {
                        // Ocultar solo este contenedor individual
                        Utils.log('Estados', `Instancia ${idBloque} sin datos, ocultando contenedor`, true);
                        contenedor.style.display = 'none';
                    } else if (tabla) {
                        hayAlgunaTablaConDatos = true;
                        const todosCompletadosEnEstaTabla = this.procesarFilasDeTabla(tabla);
                        if (!todosCompletadosEnEstaTabla) {
                            todosCompletadosGlobal = false;
                        }
                    }
                });

                // Actualizar divs de estado globales según resultado combinado
                if (hayAlgunaTablaConDatos) {
                    // Ocultar div de "sin obligatorio"
                    const divNoTabla = document.querySelector('.sin-obligatorio');
                    if (divNoTabla) {
                        divNoTabla.style.display = 'none';
                    }
                    this.actualizarDivsEstado(todosCompletadosGlobal);
                } else {
                    // Ninguna instancia tiene datos
                    this.manejarSinDatosGlobal();
                }

                Utils.log('Estados', `Proceso de tabla de estados completado`, true);
            } catch (error) {
                Utils.log('Estados', `ERROR CRÍTICO: ${error.message}`, true);
            }
        },

        /**
         * Procesa las filas de una tabla y retorna si todos están completados
         */
        procesarFilasDeTabla: function(tabla) {
            const filas = Array.from(tabla.querySelectorAll('tbody tr'));
            let todosCompletados = true;

            filas.forEach((fila, index) => {
                const resultado = this.procesarFilaEstado(fila, index);
                if (!resultado) {
                    todosCompletados = false;
                }
            });

            return todosCompletados;
        },

        /**
         * Maneja el caso en que ninguna instancia tiene datos
         */
        manejarSinDatosGlobal: function() {
            Utils.log('Estados', `Ninguna instancia tiene datos, mostrando estado sin obligatorios`, true);

            try {
                const divCompleta = document.querySelector('.fo-completa');
                const divIncompleta = document.querySelector('.fo-incompleta');
                const divNoTabla = document.querySelector('.sin-obligatorio');

                if (divCompleta) {
                    divCompleta.style.display = 'none';
                    Utils.log('Estados', `Div .fo-completa ocultado`);
                }

                if (divIncompleta) {
                    divIncompleta.style.display = 'none';
                    Utils.log('Estados', `Div .fo-incompleta ocultado`);
                }

                if (divNoTabla) {
                    divNoTabla.setAttribute('style', 'display: block !important');
                    Utils.log('Estados', `Div info no obligatoria mostrado`);
                }
            } catch (error) {
                Utils.log('Estados', `ERROR manipulando divs de estado: ${error.message}`, true);
            }
        },

        /**
         * Obtiene el contenedor de estados por ID
         */
        obtenerContenedorEstados: function(idBloque) {
            const contenedor = document.getElementById(idBloque);

            if (!contenedor) {
                Utils.log('Estados', `ERROR: No se encontró el contenedor con ID: ${idBloque}`, true);
                return null;
            }

            Utils.log('Estados', `Contenedor encontrado: ${contenedor.tagName}#${idBloque}`);
            return contenedor;
        },

        /**
         * Analiza el contenido de la tabla
         */
        analizarContenidoTabla: function(contenedor) {
            const blockContent = contenedor.querySelector('.content.block-content');
            if (!blockContent) {
                Utils.log('Estados', `ERROR: No se encontró el contenido del bloque`, true);
                return { noHayDatos: true, tabla: null };
            }

            // Verificar indicadores de "sin datos"
            const noResultsElement = contenedor.querySelector('.no-results');
            const noDataText = contenedor.textContent.toLowerCase().includes('no hay registros') ||
                              contenedor.textContent.toLowerCase().includes('no data available');

            // Buscar tabla
            let tabla = contenedor.querySelector('.totara-table-container table') ||
                       contenedor.querySelector('table');

            let hayFilas = false;
            if (tabla) {
                const tbody = tabla.querySelector('tbody');
                const filas = tbody ? tbody.querySelectorAll('tr') : [];
                hayFilas = filas.length > 0;
                Utils.log('Estados', `Tabla: ${!!tabla}, Tbody: ${!!tbody}, Filas: ${filas.length}`);
            }

            const noHayDatos = !!noResultsElement || noDataText || !tabla || !hayFilas;

            Utils.log('Estados', `ESTADO: No hay datos: ${noHayDatos}`);

            return { noHayDatos, tabla };
        },

        /**
         * @deprecated Usar manejarSinDatosGlobal en su lugar para el flujo multi-instancia
         * Se mantiene por si alguna referencia externa la usa
         */
        manejarTablaVacia: function(contenedor) {
            Utils.log('Estados', `Se detectó que no hay datos, ocultando la instancia`, true);
            contenedor.style.display = 'none';

            try {
                const divCompleta = document.querySelector('.fo-completa');
                const divIncompleta = document.querySelector('.fo-incompleta');
                const divNoTabla = document.querySelector('.sin-obligatorio');

                if (divCompleta) {
                    divCompleta.style.display = 'none';
                    Utils.log('Estados', `Div .fo-completa ocultado`);
                }

                if (divIncompleta) {
                    divIncompleta.style.display = 'none';
                    Utils.log('Estados', `Div .fo-incompleta ocultado`);
                }

                if (divNoTabla) {
                    divNoTabla.setAttribute('style', 'display: block !important');
                    Utils.log('Estados', `Div info no obligatoria mostrado`);
                }
            } catch (error) {
                Utils.log('Estados', `ERROR manipulando divs de estado: ${error.message}`, true);
            }
        },

        /**
         * @deprecated Usar procesarFilasDeTabla + actualizarDivsEstado por separado
         * Se mantiene por compatibilidad
         */
        procesarTablaConDatos: function(tabla) {
            const divNoTabla = document.querySelector('.sin-obligatorio');
            if (divNoTabla) {
                divNoTabla.style.display = 'none';
                Utils.log('Estados', `Div info no obligatoria ocultado`);
            }

            Utils.log('Estados', `Procesando tabla con datos`);

            const filas = Array.from(tabla.querySelectorAll('tbody tr'));
            let todosCompletados = true;

            filas.forEach((fila, index) => {
                const resultado = this.procesarFilaEstado(fila, index);
                if (!resultado) {
                    todosCompletados = false;
                }
            });

            this.actualizarDivsEstado(todosCompletados);
        },

        /**
         * Procesa una fila de estado individual
         */
        procesarFilaEstado: function(fila, index) {
            try {
                const celdas = fila.querySelectorAll('td');
                if (celdas.length === 0) return true;

                const celdaEstado = celdas[celdas.length - 1];
                const textoOriginal = celdaEstado.textContent.trim().toLowerCase();

                // Si ya está transformado, retornar el estado
                if (textoOriginal === '✓' || textoOriginal === '–') {
                    return textoOriginal === '✓';
                }

                // Transformar según el valor
                if (['yes', 'si', 'sí', 'sim'].includes(textoOriginal)) {
                    celdaEstado.textContent = '✓';
                    Utils.log('Estados', `Fila ${index + 1}: "${textoOriginal}" -> "✓"`);
                    return true;
                } else if (['no', 'não'].includes(textoOriginal)) {
                    celdaEstado.textContent = '–';
                    Utils.log('Estados', `Fila ${index + 1}: "${textoOriginal}" -> "–"`);
                    return false;
                }

                return textoOriginal === '✓';
            } catch (error) {
                Utils.log('Estados', `Error procesando fila ${index + 1}: ${error.message}`, true);
                return true;
            }
        },

        /**
         * Actualiza los divs de estado
         */
        actualizarDivsEstado: function(todosCompletados) {
            try {
                const divCompleta = document.querySelector('.fo-completa');
                const divIncompleta = document.querySelector('.fo-incompleta');

                if (divCompleta && divIncompleta) {
                    divCompleta.style.display = todosCompletados ? 'block' : 'none';
                    divIncompleta.style.display = todosCompletados ? 'none' : 'block';

                    const mensaje = todosCompletados ?
                        'Todos completados, mostrando .fo-completa' :
                        'Estados incompletos, mostrando .fo-incompleta';
                    Utils.log('Estados', mensaje);
                } else {
                    Utils.log('Estados', `No se encontraron los divs .fo-completa o .fo-incompleta`, true);
                }
            } catch (error) {
                Utils.log('Estados', `ERROR actualizando divs de estado: ${error.message}`, true);
            }
        },

        /**
         * Crea un acordeón a partir de un div específico
         */
        acordeonVisorLFE: function(divId) {
            Utils.log('Acordeón', `Creando acordeón para div: ${divId}`);

            const mainDiv = document.getElementById(divId);
            if (!mainDiv) {
                Utils.log('Acordeón', `No se encontró el div con ID: ${divId}`, true);
                return;
            }

            const elementos = this.obtenerElementosAcordeon(mainDiv);
            if (!elementos) return;

            const { header, content, h2 } = elementos;
            let isExpanded = true;

            this.configurarEstilosAcordeon(header, content);
            this.configurarIconoAcordeon(divId, false);
            this.configurarEventoClick(divId, header, content, isExpanded);

            Utils.log('Acordeón', `Acordeón creado exitosamente para div: ${divId}`);
        },

        /**
         * Obtiene los elementos necesarios del acordeón
         */
        obtenerElementosAcordeon: function(mainDiv) {
            const header = mainDiv.querySelector('.header.block-header');
            const content = mainDiv.querySelector('.content.block-content');
            const h2 = header?.querySelector('h2');

            if (!header || !content || !h2) {
                Utils.log('Acordeón', `No se encontraron elementos necesarios`, true);
                return null;
            }

            return { header, content, h2 };
        },

        /**
         * Configura los estilos del acordeón
         */
        configurarEstilosAcordeon: function(header, content) {
            header.style.cursor = 'pointer';
            content.style.cssText = `
                overflow: hidden;
                transition: max-height ${config.stylesConfig.animations.duration} ${config.stylesConfig.animations.timingFunction},
                           opacity ${config.stylesConfig.animations.duration} ${config.stylesConfig.animations.timingFunction};
                max-height: ${content.scrollHeight}px;
                opacity: 1;
            `;
        },

        /**
         * Configura el ícono del acordeón
         */
        configurarIconoAcordeon: function(divId, collapsed) {
            const iconUrl = collapsed ?
                `url('${config.stylesConfig.icons.plusCircleIcon}')` :
                `url('${config.stylesConfig.icons.minusCircleIcon}')`;

            let styleElement = document.getElementById(`style-${divId}`);
            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = `style-${divId}`;
                document.head.appendChild(styleElement);
            }

            styleElement.textContent = `
                div#region-main #${divId} .header.block-header h2::after {
                    content: "";
                    display: inline-block;
                    width: 25px;
                    height: 25px;
                    background-image: ${iconUrl};
                    background-size: contain;
                    background-repeat: no-repeat;
                    margin-left: 15px;
                    vertical-align: middle;
                }
            `;
        },

        /**
         * Configura el evento click del acordeón
         */
        configurarEventoClick: function(divId, header, content, isExpanded) {
            header.addEventListener('click', () => {
                isExpanded = !isExpanded;

                if (!isExpanded) {
                    // Contraer
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    void content.offsetWidth; // Forzar reflow
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    content.style.paddingTop = '0';
                    content.style.paddingBottom = '0';
                    content.style.marginBottom = '0';
                    header.style.borderRadius = 'var(--block-radius)';
                    this.configurarIconoAcordeon(divId, true);
                } else {
                    // Expandir
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    content.style.opacity = '1';
                    content.style.paddingTop = '';
                    content.style.paddingBottom = '';
                    content.style.marginBottom = '';
                    header.style.borderRadius = 'var(--block-radius) var(--block-radius) 0 0';
                    this.configurarIconoAcordeon(divId, false);

                    setTimeout(() => {
                        content.style.maxHeight = `${content.scrollHeight}px`;
                    }, parseFloat(config.stylesConfig.animations.duration) * 1000);
                }
            });
        },

        /**
         * Inicializa los acordeones para los divs especificados en la configuración
         */
        initAcordeones: function() {
            if (!URLMatcher.isUrlPatternMatched(config.acordeonConfig)) {
                Utils.log('Acordeón', `URL o ID no permitido para crear acordeones`);
                return;
            }

            Utils.log('Acordeón', `Patrón de URL permitido encontrado, creando acordeones...`);

            this.ocultarContenedorPuntuacionMaxima();
            this.procesarAcordeones();
            this.gestionarPuntuacion();
        },

        /**
         * Oculta el contenedor de puntuación máxima según el dashboard actual
         */
        ocultarContenedorPuntuacionMaxima: function() {
            const instanciaId = ScoreManager.obtenerInstanciaPuntuacionMaxima();
            const divContenedor = document.getElementById(instanciaId);
            if (divContenedor) {
                divContenedor.style.display = "none";
                Utils.log('Acordeón', `Contenedor con ID ${instanciaId} ocultado`);
            } else {
                Utils.log('Acordeón', `No se encontró el div con ID ${instanciaId}`, true);
            }
        },

        /**
         * Procesa los acordeones
         */
        procesarAcordeones: function() {
            config.acordeonConfig.instancias.forEach(divId => {
                const div = document.getElementById(divId);
                if (div) {
                    this.acordeonVisorLFE(divId);
                }
            });
        },

        /**
         * Gestiona la puntuación
         */
        gestionarPuntuacion: function() {
            const puntuacionTotal = ScoreManager.calcularPuntuacionTotal();

            // Actualizar spans inmediatamente
            ScoreManager.actualizarSpansPuntuacion();

            // Si hay contenido, programar actualizaciones adicionales
            if (ScoreManager.contenidoEncontrado) {
                setTimeout(() => ScoreManager.actualizarSpansPuntuacion(), 1000);
                this.configurarObservadorPuntuacion();
            }

            return puntuacionTotal;
        },

        /**
         * Configura el observador de puntuación
         */
        configurarObservadorPuntuacion: function() {
            if (window.MutationObserver && !window.observadorPuntuacionLFE) {
                let contadorCorrecciones = 0;
                const maxCorrecciones = 5;

                const verificarYCorregirSpans = () => {
                    if (contadorCorrecciones >= maxCorrecciones) {
                        window.observadorPuntuacionLFE.disconnect();
                        Utils.log('Acordeón', `Límite de correcciones alcanzado`, true);
                        return;
                    }

                    const spans = document.querySelectorAll('.lfe-visor-puntuacion');
                    spans.forEach(span => {
                        const textoActual = span.textContent;
                        const necesitaCorreccion = !span.classList.contains('lfe-actualizado') ||
                                                 (textoActual.startsWith('0/') && ScoreManager.puntuacionCalculada > 0) ||
                                                 textoActual.includes('XXX');

                        if (necesitaCorreccion) {
                            contadorCorrecciones++;
                            const puntuacionMaxima = ScoreManager.obtenerPuntuacionMaxima();
                            span.textContent = `${ScoreManager.puntuacionCalculada}/${puntuacionMaxima}`;
                            span.classList.add('lfe-actualizado');
                            Utils.log('Acordeón', `Corrección automática #${contadorCorrecciones}: ${span.textContent}`, true);
                        }
                    });
                };

                window.observadorPuntuacionLFE = new MutationObserver(Utils.debounce(verificarYCorregirSpans, 300));
                window.observadorPuntuacionLFE.observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });

                Utils.log('Acordeón', `Observador de mutaciones activado (máximo ${maxCorrecciones} correcciones)`, true);

                // Desconectar después de 5 segundos
                setTimeout(() => {
                    if (window.observadorPuntuacionLFE) {
                        window.observadorPuntuacionLFE.disconnect();
                        Utils.log('Acordeón', `Observador desconectado después de 5 segundos`, true);
                    }
                }, 5000);
            }
        },

        /**
         * Reemplaza los íconos en las tablas según la configuración
         */
        replaceTableIcons: function() {
            if (!URLMatcher.isUrlPatternMatched(config.iconReplacerConfig)) {
                Utils.log('IconReplacer', `URL o ID no permitido para reemplazar íconos`);
                return;
            }

            Utils.log('IconReplacer', `Patrón de URL permitido encontrado, reemplazando íconos...`);

            config.iconReplacerConfig.instancias.forEach(instancia => {
                Utils.waitForElementLegacy(`#${instancia}`, (container) => {
                    this.procesarIconosContainer(container, instancia);
                });
            });
        },

        /**
         * Procesa los íconos de un contenedor
         */
        procesarIconosContainer: function(container, instancia) {
            const filas = container.querySelectorAll('tr');

            if (filas && filas.length > 0) {
                Utils.log('IconReplacer', `Se encontraron ${filas.length} filas en #${instancia}`);
                this.procesarFilasConIconos(filas);
            } else {
                // Enfoque simple si no hay filas
                this.procesarImagenesSimples(container, instancia);
            }
        },

        /**
         * Procesa filas con íconos
         */
        procesarFilasConIconos: function(filas) {
            filas.forEach(fila => {
                const customFieldCell = fila.querySelector('td.course_custom_field_1');
                const useLfeIcon = customFieldCell &&
                                 customFieldCell.textContent.toLowerCase().includes('lfe');

                if (customFieldCell) {
                    customFieldCell.style.display = 'none';
                    Utils.log('IconReplacer', `Celda course_custom_field_1 ocultada`);
                }

                const iconUrl = useLfeIcon ?
                    config.iconReplacerConfig.lfeIconUrl :
                    config.iconReplacerConfig.newIconUrl;

                const imagenes = fila.querySelectorAll('img');
                imagenes.forEach(img => {
                    const originalSrc = img.src;
                    img.src = iconUrl;
                    Utils.log('IconReplacer', `Imagen reemplazada: ${originalSrc} -> ${iconUrl}`);
                });
            });
        },

        /**
         * Procesa imágenes de forma simple
         */
        procesarImagenesSimples: function(container, instancia) {
            const imagenes = container.querySelectorAll('img');
            Utils.log('IconReplacer', `Se encontraron ${imagenes.length} imágenes en #${instancia}`);

            imagenes.forEach(img => {
                const originalSrc = img.src;
                img.src = config.iconReplacerConfig.newIconUrl;
                Utils.log('IconReplacer', `Imagen reemplazada: ${originalSrc} -> ${config.iconReplacerConfig.newIconUrl}`);
            });
        },

        /**
         * Añade iconos de completado y oculta el estado de completado original
         */
        addCompletionIconAndHideStatus: function() {
            if (!URLMatcher.isUrlPatternMatched(config.completionIconConfig)) {
                Utils.log('Icono', `URL o ID no permitido para añadir el icono de completado`);
                return;
            }

            Utils.log('Icono', `Patrón de URL permitido encontrado, añadiendo iconos de completado...`);

            document.querySelectorAll('td.course_completion_iscomplete').forEach(td => {
                td.style.display = 'none';
                const completionText = td.textContent.trim().toLowerCase();
                const siRegex = /^s[ií]$/;
                const yesRegex = /^yes$/;

                if (siRegex.test(completionText) || yesRegex.test(completionText)) {
                    this.añadirIconoCompletado(td);
                }
            });
        },

        /**
         * Añade ícono de completado a un elemento
         */
        añadirIconoCompletado: function(td) {
            const link = td.parentNode.querySelector('.course_courselinkicon a');
            if (link) {
                const icon = document.createElement('img');
                icon.src = config.stylesConfig.icons.completedIcon;
                icon.style.cssText = `
                    display: block;
                    width: 20px;
                    height: 20px;
                    position: absolute;
                    right: 10px;
                    top: 24px;
                `;

                if (!link.style.position || link.style.position === 'static') {
                    link.style.position = 'relative';
                }

                link.appendChild(icon);
                Utils.log('Icono', `Icono de completado añadido.`);
            }
        },

        /**
         * Oculta los divs de Current Learning o Programas que no contienen cursos matriculados
         */
        hideCurrentLearningVacios: function(instanceIds) {
            if (!URLMatcher.isUrlPatternMatched(config.currentLearningVaciosConfig)) {
                Utils.log('CurrentLearningVacios', `URL o ID no permitido para ocultar contenedores vacíos`);
                return;
            }

            Utils.log('CurrentLearningVacios', `Verificando ${instanceIds.length} instancias para ocultar si están vacíos`, true);

            instanceIds.forEach(instId => {
                try {
                    this.procesarInstanciaCurrentLearning(instId);
                } catch (error) {
                    Utils.log('CurrentLearningVacios', `Error al procesar ${instId}: ${error.message}`, true);
                }
            });
        },

        /**
         * Procesa una instancia de Current Learning
         */
        procesarInstanciaCurrentLearning: function(instId) {
            const container = document.getElementById(instId);
            if (!container) {
                Utils.log('CurrentLearningVacios', `No se encontró el contenedor con ID: ${instId}`, true);
                return;
            }

            Utils.log('CurrentLearningVacios', `Analizando contenedor ${instId}`);

            const tipoContenedor = this.identificarTipoContenedor(container);
            const hasContent = this.verificarContenidoContainer(container, tipoContenedor);

            if (!hasContent) {
                Utils.log('CurrentLearningVacios', `No se encontró contenido relevante en ${instId}, ocultando contenedor`, true);
                container.style.display = 'none';
            } else {
                Utils.log('CurrentLearningVacios', `Contenedor ${instId} tiene contenido, manteniéndolo visible`);
            }
        },

        /**
         * Identifica el tipo de contenedor
         */
        identificarTipoContenedor: function(container) {
            const isLearning = container.classList.contains('block_current_learningas');
            const isProgramas = container.classList.contains('block_current_programsas');

            return {
                isLearning,
                isProgramas,
                tilesClass: isLearning ? '.block_current_learningas-tiles' : '.block_current_programsas-tiles',
                tileItemClass: isLearning ? 'li.block_current_learningas-tile' : 'li.block_current_programsas-tile'
            };
        },

        /**
         * Verifica el contenido del contenedor
         */
        verificarContenidoContainer: function(container, tipo) {
            const tilesContainer = container.querySelector(tipo.tilesClass);
            if (!tilesContainer) {
                Utils.log('CurrentLearningVacios', `No se encontró el contenedor de tiles`, true);
                return false;
            }

            // Buscar ULs que no sean dropdown-menu
            const contentULs = Array.from(tilesContainer.querySelectorAll('ul')).filter(ul =>
                !ul.classList.contains('dropdown-menu'));

            // Verificar si hay ULs con elementos LI
            for (const ul of contentULs) {
                const liItems = ul.querySelectorAll('li');
                if (liItems.length > 0) {
                    Utils.log('CurrentLearningVacios', `Encontrado UL con ${liItems.length} elementos LI, manteniendo visible`, true);
                    return true;
                }
            }

            // Verificar directamente los LI de curso
            const courseElements = container.querySelectorAll(tipo.tileItemClass);
            if (courseElements.length > 0) {
                Utils.log('CurrentLearningVacios', `Encontrados ${courseElements.length} elementos de curso, manteniendo visible`);
                return true;
            }

            return false;
        },

        /**
         * Función principal de inicialización
         */
        init: function() {
            const currentPath = window.location.pathname;
            const currentUrl = currentPath + window.location.search;

            const isUrlMatched = config.pathPatterns.some(pattern => {
                if (pattern.endsWith('id=')) {
                    return currentUrl.includes(pattern) && Utils.getQueryParam('id') !== null;
                }
                return currentPath.includes(pattern) || currentUrl.includes(pattern);
            });

            // Verificar si estamos en una ruta de feedback
            if (config.feedbackFacesConfig.enabledForPaths.some(path => currentPath.includes(path))) {
                Utils.log('Dashboard', `URL de feedback detectada: ${currentUrl}`);
                this.replaceFeedbackNumbers();
            } else if (isUrlMatched) {
                Utils.log('Dashboard', `URL coincide con patrones configurados: ${currentUrl}`);
                this.inicializarModulosPrincipales();
            } else {
                Utils.log('Dashboard', `URL no coincide con los patrones configurados: ${currentUrl}`);
            }
        },

        /**
         * Inicializa los módulos principales
         */
        inicializarModulosPrincipales: function() {
            // Inicializar etiquetas obligatorias
            MandatoryLabelsModule.init();

            // Inicializar procesamiento de tabla de estados (multi-instancia)
            this.inicializarTablaEstados();

            // Inicializar acordeones
            this.initAcordeones();

            // Inicializar reemplazo de íconos en tablas
            this.replaceTableIcons();

            // Inicializar iconos de completado
            Utils.waitForElementLegacy('.course_completion_iscomplete', () => {
                this.addCompletionIconAndHideStatus();
            });

            // Inicializar ocultar Current Learning vacíos
            this.inicializarCurrentLearningVacios();

            // Inicializar Plan Ciberseguridad 2026 (async, no bloquea al resto)
            CyberPlanModule.init();
        },

        /**
         * Inicializa la tabla de estados para múltiples instancias
         */
        inicializarTablaEstados: function() {
            // Obtener array de instancias (compatible con formato antiguo y nuevo)
            const instancias = Array.isArray(config.tablaEstadosConfig.instancias)
                ? config.tablaEstadosConfig.instancias
                : [config.tablaEstadosConfig.instancias || config.tablaEstadosConfig.instancia];

            Utils.log('Dashboard', `Inicializando tabla de estados para ${instancias.length} instancia(s): ${instancias.join(', ')}`);

            let instanciasEncontradas = 0;
            let instanciasTotales = instancias.length;

            instancias.forEach(instId => {
                const estadosContainer = document.getElementById(instId);
                if (estadosContainer) {
                    instanciasEncontradas++;
                    Utils.log('Dashboard', `Contenedor de tabla de estados encontrado: ${instId}`);
                } else {
                    Utils.log('Dashboard', `Contenedor de tabla de estados no encontrado: ${instId}`);
                }
            });

            // Ejecutar procesarTablaEstados cuando se hayan verificado todas las instancias
            if (instanciasEncontradas > 0) {
                Utils.log('Dashboard', `${instanciasEncontradas}/${instanciasTotales} contenedores encontrados, procesando estados...`);
                this.procesarTablaEstados();
            } else {
                Utils.log('Dashboard', `Ningún contenedor de tabla de estados encontrado, procesando como vacío...`);
                this.procesarTablaEstados();
            }
        },

        /**
         * Inicializa Current Learning vacíos
         */
        inicializarCurrentLearningVacios: function() {
            if (config.currentLearningVaciosConfig && config.currentLearningVaciosConfig.instancias) {
                Utils.log('Dashboard', `Inicializando verificación de Current Learning vacíos...`);

                const checkAndHideEmptyContainers = () => {
                    let allContainersFound = true;

                    config.currentLearningVaciosConfig.instancias.forEach(instId => {
                        if (!document.getElementById(instId)) {
                            allContainersFound = false;
                        }
                    });

                    if (allContainersFound) {
                        Utils.log('Dashboard', `Todos los contenedores encontrados, ejecutando hideCurrentLearningVacios`);
                        this.hideCurrentLearningVacios(config.currentLearningVaciosConfig.instancias);
                    } else {
                        Utils.log('Dashboard', `Esperando a que se carguen todos los contenedores...`);
                        setTimeout(checkAndHideEmptyContainers, 300);
                    }
                };

                checkAndHideEmptyContainers();
            }
        }
    };

    // Iniciar todas las funcionalidades
    DashboardFunctions.init();

    // Función para limpiar recursos al salir
    window.addEventListener('beforeunload', () => {
        MandatoryLabelsModule.destroy();
        CyberPlanModule.destroy();
        if (window.observadorPuntuacionLFE) {
            window.observadorPuntuacionLFE.disconnect();
        }
    });
});

/**************** SCRIPT QUITAR IDIOMA *******************/
(function() {
    const LanguageSelector = {
        init: function() {
            this.verificarYOcultar();
            this.configurarObservador();
        },

        verificarYOcultar: function() {
            // Verificar si existe un elemento con la clase tenant-user-ext
            const tenantUserExt = document.querySelector('.tenant-user-ext');

            if (!tenantUserExt) return false;

            return this.ocultarSelectorIdioma();
        },

        ocultarSelectorIdioma: function() {
            // Método 1: Por data-title
            let selector = document.querySelector('a[data-title="selectedlang"]');
            if (selector && selector.closest('li')) {
                selector.closest('li').style.display = 'none';
                return true;
            }

            // Método 2: Por el ícono característico
            selector = document.querySelector('#action-menu-0-menu li a .tfont-var-chevron-right');
            if (selector && selector.closest('li')) {
                selector.closest('li').style.display = 'none';
                return true;
            }

            // Método 3: Por la estructura
            const menuItems = document.querySelectorAll('#action-menu-0-menu li');
            for (let i = 0; i < menuItems.length; i++) {
                const currentItem = menuItems[i];
                const nextItem = menuItems[i + 1];
                if (nextItem && nextItem.querySelector('a[data-title^="notselected lang_"]')) {
                    currentItem.style.display = 'none';
                    return true;
                }
            }

            return false;
        },

        configurarObservador: function() {
            if (!this.verificarYOcultar()) {
                let intentos = 0;
                const interval = setInterval(() => {
                    if (this.verificarYOcultar() || intentos >= 15) {
                        clearInterval(interval);
                    }
                    intentos++;
                }, 200);
            }

            const observer = new MutationObserver(() => {
                this.verificarYOcultar();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LanguageSelector.init());
    } else {
        LanguageSelector.init();
    }
})();
// Script para detectar idioma e insertar contenido HTML según el idioma detectado
const EnrollmentPageHandler = {
    init: function() {
        console.log("[ENROL PAGE MOD] Script iniciado");

        this.checkConditionsAndExecute();
    },

    checkConditionsAndExecute: function() {
        const hasTenantUserExt = document.querySelector('.tenant-user-ext') === null;
        const isEnrolPage = window.location.href.includes("/enrol/index.php?id=");
        const hasInfoContentEsq = document.querySelector('.infocontent.esq') !== null;

        console.log("[ENROL PAGE MOD] Condiciones iniciales:", {
            hasTenantUserExt,
            isEnrolPage,
            hasInfoContentEsq
        });

        if (isEnrolPage) {
            this.updatePageTitle();
        }

        if (hasTenantUserExt && isEnrolPage && hasInfoContentEsq) {
            this.handleEnrollmentContent();
        } else {
            console.log("[ENROL PAGE MOD] No se cumplen las condiciones para ejecutar este script");
        }
    },

    updatePageTitle: function() {
        console.log("[ENROL PAGE MOD] Actualizando título de la pestaña");

        const infoContentDiv = document.querySelector('.infocontent.esq');
        if (!infoContentDiv) {
            console.log("[ENROL PAGE MOD] No se encontró el div con clase 'infocontent esq'");
            return;
        }

        const h2Element = infoContentDiv.querySelector('h2');
        if (!h2Element) {
            console.log("[ENROL PAGE MOD] No se encontró el elemento h2");
            return;
        }

        const aElement = h2Element.querySelector('a');
        if (!aElement) {
            console.log("[ENROL PAGE MOD] No se encontró el enlace dentro del h2");
            return;
        }

        const courseTitle = aElement.textContent.trim();
        if (courseTitle) {
            document.title = courseTitle;
            console.log("[ENROL PAGE MOD] Título actualizado a:", courseTitle);
        }
    },

    handleEnrollmentContent: function() {
        console.log("[ENROL PAGE MOD] Condiciones cumplidas, verificando enrolinstances");

        const enrolInstancesDiv = document.querySelector('.enrolinstances');
        const hasContent = enrolInstancesDiv &&
                          (enrolInstancesDiv.children.length > 0 ||
                           enrolInstancesDiv.textContent.trim() !== '');

        console.log("[ENROL PAGE MOD] enrolinstances tiene contenido:", hasContent);

        if (hasContent) {
            this.hideAsCoursecustomfields();
        } else {
            this.executeFullScript();
        }
    },

    hideAsCoursecustomfields: function() {
        console.log("[ENROL PAGE MOD] Solo ocultando ascoursecustomfields");

        const ascoursecustomfieldsDiv = document.querySelector('.ascoursecustomfields');
        if (ascoursecustomfieldsDiv) {
            ascoursecustomfieldsDiv.style.display = 'none';
            console.log("[ENROL PAGE MOD] Div ascoursecustomfields ocultado");
        }
    },

    executeFullScript: function() {
        console.log("[ENROL PAGE MOD] Ejecutando script completo");

        const detectedLanguage = this.detectLanguage();
        if (!detectedLanguage) return;

        const structure = this.getPageStructure();
        if (!structure) return;

        this.insertContentAndModifyStructure(structure, detectedLanguage);
    },

    detectLanguage: function() {
        const menuElement = document.getElementById('totaramenuitem37');
        if (!menuElement) {
            console.log("[ENROL PAGE MOD] No se encontró el elemento totaramenuitem37");
            return null;
        }

        const languageLabel = menuElement.querySelector('.totaraNav_prim--list_item_label');
        if (!languageLabel) {
            console.log("[ENROL PAGE MOD] No se encontró el label del idioma");
            return null;
        }

        const menuText = languageLabel.textContent.trim();
        console.log("[ENROL PAGE MOD] Texto del menú:", menuText);

        const languageMap = {
            'Minha Formação': 'PT',
            'Moje školení': 'CS',
            'My Training': 'EN',
            'La mia formazione': 'IT',
            'Mi Formación': 'ES',
            'Min utbildning': 'SV'
        };

        for (const [text, lang] of Object.entries(languageMap)) {
            if (menuText.includes(text)) {
                console.log("[ENROL PAGE MOD] Idioma detectado:", lang);
                return lang;
            }
        }

        console.log("[ENROL PAGE MOD] Usando idioma por defecto: EN");
        return 'EN';
    },

    getPageStructure: function() {
        const mainDiv = document.querySelector('div[role="main"]');
        if (!mainDiv) {
            console.log("[ENROL PAGE MOD] No se encontró div[role='main']");
            return null;
        }

        const rowDiv = mainDiv.querySelector('.row');
        if (!rowDiv) {
            console.log("[ENROL PAGE MOD] No se encontró div.row");
            return null;
        }

        const childDivs = Array.from(rowDiv.children).filter(child => child.tagName === 'DIV');
        if (childDivs.length < 2) {
            console.log("[ENROL PAGE MOD] No se encontraron suficientes divs");
            return null;
        }

        let firstDiv, secondDiv;
        if (childDivs[0].querySelector('.infocontent.esq')) {
            firstDiv = childDivs[0];
            secondDiv = childDivs[1];
        } else if (childDivs[1].querySelector('.infocontent.esq')) {
            firstDiv = childDivs[1];
            secondDiv = childDivs[0];
        } else {
            console.log("[ENROL PAGE MOD] No se pudieron identificar los divs");
            return null;
        }

        return {
            firstDiv,
            secondDiv,
            enrollForm: secondDiv.querySelector('#mform2')
        };
    },

    insertContentAndModifyStructure: function(structure, language) {
        const { firstDiv, secondDiv, enrollForm } = structure;

        const htmlContent = this.getLanguageContent();
        const infoContentElement = firstDiv.querySelector('.infocontent.esq');
        if (!infoContentElement) {
            console.log("[ENROL PAGE MOD] No se encontró .infocontent.esq");
            return;
        }

        const h2Element = infoContentElement.querySelector('h2');
        if (!h2Element) {
            console.log("[ENROL PAGE MOD] No se encontró h2");
            return;
        }

        // Crear y insertar estructura
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary';

        const noOverflowDiv = document.createElement('div');
        noOverflowDiv.className = 'no-overflow';
        noOverflowDiv.innerHTML = htmlContent[language];

        summaryDiv.appendChild(noOverflowDiv);
        h2Element.insertAdjacentElement('afterend', summaryDiv);

        console.log("[ENROL PAGE MOD] Contenido insertado para idioma:", language);

        // Insertar formulario clonado
        if (enrollForm) {
            const clonedForm = enrollForm.cloneNode(true);
            const lastP = noOverflowDiv.querySelector('p.last-p');

            if (lastP) {
                lastP.insertAdjacentElement('afterend', clonedForm);
                console.log("[ENROL PAGE MOD] Formulario insertado");
            }
        }

        // Modificar estructura
        firstDiv.style.width = '100%';
        const submitButton = document.querySelector('#id_submitbutton');
        if (submitButton) {
            submitButton.style.width = 'auto';
        }
        secondDiv.remove();

        console.log("[ENROL PAGE MOD] Estructura modificada");
    },

    getLanguageContent: function() {
        return {
            'ES': `<div class="info-catalogo"><div class="info-izq">Este curso está diseñado para facilitar tu formación en aspectos clave de tu actividad diaria. Podrás acceder a los contenidos a tu ritmo, con recursos útiles y prácticos para aplicar en tu trabajo.&nbsp;<p><b>Fórmate a tu ritmo, con materiales de calidad y el respaldo de IVI RMA.&nbsp;</b></p><p class="last-p">Si te interesa, puedes iniciar el curso haciendo clic en el botón inferior <b>"Matricularme"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,

            'EN': `<div class="info-catalogo"><div class="info-izq">This course is designed to support your training in key aspects of your daily work. You can access the content at your own pace, with useful and practical resources to apply in your job.&nbsp;</p><p><b>Learn at your own pace, with quality materials and the support of IVI RMA.&nbsp;</b></p><p class="last-p">If you're interested, you can start the course by clicking the <b>"Enroll"</b> button below.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,

            'PT': `<div class="info-catalogo"><div class="info-izq">Este curso foi desenvolvido para apoiar a sua formação em aspectos-chave da sua atividade diária. Você poderá acessar os conteúdos no seu próprio ritmo, com recursos úteis e práticos para aplicar no seu trabalho.&nbsp;</p><p><b>Forme-se no seu ritmo, com materiais de qualidade e o respaldo da IVI RMA.&nbsp;</b></p><p class="last-p">Se tiver interesse, pode iniciar o curso clicando no botão abaixo<b> "Matricular-me"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,

            'IT': `<div class="info-catalogo"><div class="info-izq">Questo corso è stato progettato per supportare la tua formazione sugli aspetti chiave della tua attività quotidiana. Potrai accedere ai contenuti al tuo ritmo, con risorse utili e pratiche da applicare al lavoro.&nbsp;</p><p><b>Formati al tuo ritmo, con materiali di qualità e il supporto di IVI RMA.</b>&nbsp;</p><p class="last-p">Se sei interessato, puoi iniziare il corso cliccando sul pulsante in basso <b>"Iscrivimi"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,

            'CS': `<div class="info-catalogo"><div class="info-izq">Tento kurz je navržen tak, aby podpořil vaše vzdělávání v klíčových oblastech vaší každodenní práce. K obsahu můžete přistupovat vlastním tempem, s užitečnými a praktickými materiály pro vaši práci.&nbsp;</p><p><b>Vzdělávejte se vlastním tempem, s kvalitními materiály a podporou IVI RMA.</b>&nbsp;</p><p class="last-p">Máte-li zájem, můžete kurz zahájit kliknutím na tlačítko dole "<b>Zapsat se"</b>.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`,

            'SV': `<div class="info-catalogo"><div class="info-izq">Den här kursen är utformad för att stödja din utbildning inom viktiga delar av ditt dagliga arbete. Du kan ta del av innehållet i din egen takt, med användbara och praktiska resurser att tillämpa i arbetet.&nbsp;</p><p><b>Utbilda dig i din egen takt, med kvalitetsmaterial och stöd från IVI RMA.&nbsp;</b></p><p class="last-p">Om du är intresserad kan du starta kursen genom att klicka på knappen<b> "Registrera mig"</b> nedan.</p></div><div class="img"><img src="https://ivirmacampus.com/pluginfile.php/1/local_uploadfiles/additionalimages/0/matriculate-img.svg" alt="" width="400" height="264" role="presentation" class="img-responsive atto_image_button_text-bottom"></div></div>`
        };
    }
};

// Inicializar si estamos en página de matrícula
if (window.location.href.includes("/enrol/index.php?id=")) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => EnrollmentPageHandler.init());
    } else {
        EnrollmentPageHandler.init();
    }
}


/** SCRIPT PARA EVALUACIONES **/
const EvaluationHandler = (function() {
    'use strict';

    const CONFIG = {
        NO_MORE_ATTEMPTS_MESSAGES: [
            'No se permiten más intentos',
            'No more attempts are allowed',
            'Již nemáte další pokusy',
            'Non sono permessi altri tentativi',
            'Inga fler försök tillåtna',
            'Não são permitidas mais tentativas'
        ],

        COLUMN_KEYWORDS: {
            POINTS: ['puntos', 'points', 'body', 'Punteggio', 'poäng', 'Nota'],
            GRADE: ['calificación', 'grade', 'známka', 'Valutazione', 'betyg', 'Avaliação'],
            REVIEW: ['revisión', 'review', 'Revize', 'Revisione', 'Granska', 'rever']
        },

        SELECTORS: {
            QUIZ_TABLE: 'table.quizattemptsummary',
            START_BUTTON: '.quizstartbuttondiv',
            ATTEMPT_BOX: '.box.quizattempt',
            NOTE_MIN_COMMENT: /<!--\s*<span id="nota_min_aprobado">(\d+(?:\.\d+)?)<\/span>\s*-->/
        },

        URL_PATTERN: '/mod/quiz/view.php?id='
    };

    function checkURL() {
        return window.location.href.includes(CONFIG.URL_PATTERN);
    }

    function getNotaMinima() {
        const htmlContent = document.documentElement.outerHTML;
        const match = htmlContent.match(CONFIG.SELECTORS.NOTE_MIN_COMMENT);
        return match ? parseFloat(match[1]) : null;
    }

    function identificarColumnas() {
        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return { points: -1, grade: -1, review: -1 };

        const headers = tabla.querySelectorAll('thead th');
        const columnas = { points: -1, grade: -1, review: -1 };

        headers.forEach((header, index) => {
            const textoHeader = header.textContent.toLowerCase().trim();

            if (CONFIG.COLUMN_KEYWORDS.POINTS.some(keyword =>
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.points = index;
            } else if (CONFIG.COLUMN_KEYWORDS.GRADE.some(keyword =>
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.grade = index;
            } else if (CONFIG.COLUMN_KEYWORDS.REVIEW.some(keyword =>
                textoHeader.includes(keyword.toLowerCase()))) {
                columnas.review = index;
            }
        });

        console.log('[EVALUACIÓN] Columnas identificadas:', columnas);
        return columnas;
    }

    function toggleColumna(indiceColumna, show = true) {
        if (indiceColumna === -1) return;

        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return;

        const displayValue = show ? '' : 'none';

        const header = tabla.querySelector(`thead th:nth-child(${indiceColumna + 1})`);
        if (header) header.style.display = displayValue;

        const celdas = tabla.querySelectorAll(`tbody td:nth-child(${indiceColumna + 1})`);
        celdas.forEach(celda => celda.style.display = displayValue);
    }

    function toggleBotonInicio(show = true) {
        const boton = document.querySelector(CONFIG.SELECTORS.START_BUTTON);
        if (boton) {
            boton.style.display = show ? '' : 'none';
        }
    }

    function hayMensajeNoIntentos() {
        const contenedorIntentos = document.querySelector(CONFIG.SELECTORS.ATTEMPT_BOX);
        if (!contenedorIntentos) return false;

        const textoContenedor = contenedorIntentos.textContent.trim();
        return CONFIG.NO_MORE_ATTEMPTS_MESSAGES.some(mensaje =>
            textoContenedor.includes(mensaje));
    }

    function obtenerCalificaciones(indiceColumnaGrade) {
        if (indiceColumnaGrade === -1) return [];

        const tabla = document.querySelector(CONFIG.SELECTORS.QUIZ_TABLE);
        if (!tabla) return [];

        const filasCalificacion = tabla.querySelectorAll('tbody tr');
        const calificaciones = [];

        filasCalificacion.forEach(fila => {
            const celdaCalificacion = fila.querySelector(`td:nth-child(${indiceColumnaGrade + 1})`);
            if (celdaCalificacion) {
                const textoCalificacion = celdaCalificacion.textContent.trim();
                const match = textoCalificacion.match(/(\d+(?:\.\d+)?)/);
                if (match) {
                    const calificacion = parseFloat(match[1]);
                    if (!isNaN(calificacion)) {
                        calificaciones.push(calificacion);
                    }
                }
            }
        });

        return calificaciones;
    }

    function ejecutarScript() {
        if (!checkURL()) {
            console.log('[EVALUACIÓN] URL no coincide con el patrón requerido');
            return;
        }

        const notaMinima = getNotaMinima();
        if (notaMinima === null) {
            console.log('[EVALUACIÓN] No se encontró la nota mínima de aprobado');
            return;
        }

        console.log(`[EVALUACIÓN] Nota mínima de aprobado: ${notaMinima}`);

        const columnas = identificarColumnas();

        // Ocultar columna de puntos si existe
        if (columnas.points !== -1) {
            toggleColumna(columnas.points, false);
            console.log('[EVALUACIÓN] Columna de puntos ocultada');
        }

        // Inicialmente ocultar columna Revisión
        if (columnas.review !== -1) {
            toggleColumna(columnas.review, false);
        }

        // Verificar condiciones para mostrar columna Revisión
        const calificaciones = obtenerCalificaciones(columnas.grade);
        const hayNotaAprobada = calificaciones.some(cal => cal >= notaMinima);
        const noMasIntentos = hayMensajeNoIntentos();

        console.log(`[EVALUACIÓN] Calificaciones: ${calificaciones.join(', ')}`);
        console.log(`[EVALUACIÓN] Hay nota aprobada: ${hayNotaAprobada}`);
        console.log(`[EVALUACIÓN] No más intentos: ${noMasIntentos}`);

        if (hayNotaAprobada || noMasIntentos) {
            if (columnas.review !== -1) {
                toggleColumna(columnas.review, true);
                console.log('[EVALUACIÓN] Columna de revisión mostrada');
            }

            if (hayNotaAprobada) {
                toggleBotonInicio(false);
                console.log('[EVALUACIÓN] Botón de inicio ocultado');
            }
        } else {
            toggleBotonInicio(true);
        }

        console.log('[EVALUACIÓN] Script ejecutado correctamente');
    }

    return {
        init: ejecutarScript
    };
})();

// Ejecutar evaluación si estamos en página de quiz
if (window.location.href.includes('/mod/quiz/view.php?id=')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', EvaluationHandler.init);
    } else {
        EvaluationHandler.init();
    }

    setTimeout(EvaluationHandler.init, 1000);
}

// ========== SCRIPT PARA BOTÓN INFORME-TUTOR ==========
const InformeTutorButton = {
    translations: {
        'es': 'Informe del Tutor',
        'en': 'Tutor Report',
        'pt': 'Relatório do Tutor',
        'it': 'Rapporto del Tutor',
        'sv': 'Handledarrapport',
        'cz': 'Zpráva tutora'
    },

    config: {
        reportId: '233',
        reportBaseUrl: 'https://ivirmacampus.com/totara/reportbuilder/report.php',
        debug: true
    },

    init: function() {
        this.log('Iniciando InformeTutorButton...');
        this.createButton();
    },

    createButton: function() {
        const completionBlock = document.querySelector('[data-block="completionstatus"]') ||
                               document.querySelector('.block_completionstatus');

        if (!completionBlock) {
            this.log('No se encontró bloque de completion');
            return false;
        }

        const completionLink = completionBlock.querySelector('a[href*="/report/completion/index.php?course="]');
        if (!completionLink) {
            this.log('No se encontró enlace de completion');
            return false;
        }

        this.log('Enlace encontrado, creando botón');

        // Obtener ID del curso de la URL
        const courseId = this.getCourseIdFromUrl();
        if (!courseId) {
            this.log('❌ No se pudo obtener el ID del curso de la URL');
            return false;
        }

        this.log('ID del curso obtenido:', courseId);

        // Obtener shortname del curso de forma asíncrona
        getShortname(courseId).then(shortname => {
            if (!shortname) {
                this.log('❌ No se pudo obtener el shortname del curso');
                return;
            }

            this.log('Shortname del curso obtenido:', shortname);

            // Construir URL con parámetros GET
            const reportUrl = this.buildReportUrl(shortname);
            this.log('URL generada:', reportUrl);

            // Detectar idioma y crear botón
            const lang = this.detectLanguage();
            const buttonText = this.translations[lang] || this.translations['es'];

            const newButton = document.createElement('a');
            newButton.href = reportUrl;
            newButton.className = 'informe-tutor btn btn-primary w-100';
            newButton.textContent = buttonText;
            newButton.target = '_blank';
            newButton.style.display = 'table';

            // Insertar el botón después del enlace de completion
            completionLink.parentNode.insertBefore(newButton, completionLink.nextSibling);

            this.log('✓ Botón creado exitosamente');
        }).catch(error => {
            this.log('❌ Error al obtener shortname:', error);
        });

        return true;
    },

    getCourseIdFromUrl: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    },

buildReportUrl: function(shortname) {
    // Detectar tenant IMR y usar dominio correspondiente
    const isImrTenant = document.body.classList.contains('tenant-user-imr');
    const baseUrl = isImrTenant
        ? 'https://imrcampus.com/totara/reportbuilder/report.php'
        : this.config.reportBaseUrl;

    const url = new URL(baseUrl);
    url.searchParams.set('id', this.config.reportId);
    url.searchParams.set('course-shortname', shortname);
    url.searchParams.set('course-shortname_op', '2'); // igual

    return url.toString();
},

    detectLanguage: function() {
        const bodyClasses = document.body.className;
        const langMatch = bodyClasses.match(/lang-([a-z]{2})/);
        return langMatch ? langMatch[1] : 'es';
    },

    log: function(message, data) {
        if (this.config.debug) {
            console.log('[Informe Tutor] ' + message, data || '');
        }
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => InformeTutorButton.init(), 300);
    });
} else {
    setTimeout(() => InformeTutorButton.init(), 300);
}

// ========== SCRIPT PARA AUTO-FILTRO DE REPORT BUILDER ==========
const ReportAutoFilter = {
    config: {
        reportId: '233',
        submitDelay: 800,
        submitButtonId: 'id_submitgroupstandard_addfilter',
        debug: true,
        storageKey: 'reportAutoFilterApplied_233'
    },

    filters: {
        'course-shortname': {
            inputId: 'id_course-shortname',
            selectId: 'id_course-shortname_op'
        },
        'user-fullname': {
            inputId: 'id_user-fullname',
            selectId: 'id_user-fullname_op'
        },
        'user-username': {
            inputId: 'id_user-username',
            selectId: 'id_user-username_op'
        },
        'user-emailunobscured': {
            inputId: 'id_user-emailunobscured',
            selectId: 'id_user-emailunobscured_op'
        },
        'user-custom_field_9': {
            inputId: 'id_user-custom_field_9',
            selectId: 'id_user-custom_field_9_op'
        }
    },

    init: function() {
        if (window.location.href.indexOf('/totara/reportbuilder/report.php') === -1) return;

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id') !== this.config.reportId) return;

        this.log('Página de reporte 233 detectada');
        this.cleanupOnNewReport();
        this.executeAutoFilter();
    },

    executeAutoFilter: function() {
    this.log('Iniciando auto-filtro...');

    if (this.isFilterAlreadyApplied()) {
        this.log('⚠️ El filtro ya fue aplicado anteriormente. Ocultando formularios de búsqueda...');
        this.hideSearchForms();
        return;
    }

        let filtrosAplicados = 0;
        let debeBuscar = false;

        for (const [paramName, config] of Object.entries(this.filters)) {
            const fieldValue = this.getURLParameter(paramName);
            const opValue = this.getURLParameter(paramName + '_op');

            if (fieldValue !== null && fieldValue !== '') {
                if (this.fillTextField(config.inputId, fieldValue)) {
                    filtrosAplicados++;
                    debeBuscar = true;
                }
            }

            if (opValue !== null && opValue !== '') {
                this.setSelectValue(config.selectId, opValue);
            }
        }

        if (debeBuscar && filtrosAplicados > 0) {
            this.log('Filtros aplicados: ' + filtrosAplicados);
            this.log('Esperando ' + this.config.submitDelay + 'ms antes de buscar...');

            this.markFilterAsApplied();

            setTimeout(() => {
                if (this.clickSearchButton()) {
                    this.log('✓ Auto-filtro completado exitosamente');
                } else {
                    this.log('✗ Error: No se pudo hacer clic en el botón de búsqueda');
                }
            }, this.config.submitDelay);
        } else {
            this.log('No se encontraron parámetros de filtro en la URL');
        }
    },

    getURLParameter: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    log: function(message, data) {
        if (this.config.debug) {
            console.log('[Report AutoFilter] ' + message, data || '');
        }
    },

    getFieldValue: function(inputId) {
        const input = document.getElementById(inputId);
        return input ? input.value : null;
    },

    fillTextField: function(inputId, value) {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = decodeURIComponent(value);
            this.log('Campo rellenado:', inputId + ' = ' + value);
            return true;
        } else {
            this.log('Campo no encontrado:', inputId);
            return false;
        }
    },

    setSelectValue: function(selectId, value) {
        const select = document.getElementById(selectId);
        if (select) {
            select.value = value;
            this.log('Select actualizado:', selectId + ' = ' + value);
            return true;
        } else {
            this.log('Select no encontrado:', selectId);
            return false;
        }
    },

    clickSearchButton: function() {
        const submitBtn = document.getElementById(this.config.submitButtonId);
        if (submitBtn) {
            this.log('Haciendo clic en el botón de búsqueda...');
            submitBtn.click();
            return true;
        } else {
            this.log('Botón de búsqueda no encontrado:', this.config.submitButtonId);
            return false;
        }
    },
hideSearchForms: function() {
    const savedSearch = document.getElementById('totara_reportbuilder_viewsavedsearch');
    if (savedSearch) {
        savedSearch.style.display = 'none';
        this.log('✓ #totara_reportbuilder_viewsavedsearch ocultado');
    }

    const searchForm = document.querySelector('form.rb-search.mform');
    if (searchForm) {
        searchForm.style.display = 'none';
        this.log('✓ form.rb-search.mform ocultado');
    }
},
isFilterAlreadyApplied: function() {
    const urlWithParams = window.location.href;
    const lastApplied = sessionStorage.getItem(this.config.storageKey);

    // 1. Match exacto de URL (caso donde la URL conserva los params tras el submit)
    if (lastApplied === urlWithParams) {
        this.log('✓ Filtro ya aplicado (sessionStorage URL match)');
        return true;
    }

    // 2. Los campos del DOM coinciden con los params de la URL actual
    for (const [paramName, config] of Object.entries(this.filters)) {
        const urlValue = this.getURLParameter(paramName);
        if (urlValue) {
            const fieldValue = this.getFieldValue(config.inputId);
            if (fieldValue === decodeURIComponent(urlValue)) {
                this.log('✓ Campo coincide con URL actual:', config.inputId);
                return true;
            }
        }
    }

    // 3. La URL actual perdió los params, pero hay sessionStorage previo:
    //    comparar el DOM con los valores de la URL guardada
    if (lastApplied) {
        try {
            const previousUrl = new URL(lastApplied);
            for (const [paramName, config] of Object.entries(this.filters)) {
                const expectedValue = previousUrl.searchParams.get(paramName);
                if (expectedValue) {
                    const fieldValue = this.getFieldValue(config.inputId);
                    if (fieldValue === decodeURIComponent(expectedValue)) {
                        this.log('✓ Campo coincide con URL previa guardada:', config.inputId);
                        return true;
                    }
                }
            }
        } catch (e) {
            // URL inválida en sessionStorage, ignorar
        }
    }

    return false;
},

    markFilterAsApplied: function() {
        const urlWithParams = window.location.href;
        sessionStorage.setItem(this.config.storageKey, urlWithParams);
        this.log('Filtro marcado como aplicado en sessionStorage');
    },

    clearFilterMark: function() {
        sessionStorage.removeItem(this.config.storageKey);
        this.log('Marca de filtro aplicado limpiada');
    },

    cleanupOnNewReport: function() {
        const currentReportId = this.getURLParameter('id');
        const lastReportId = sessionStorage.getItem('lastReportId');

        if (currentReportId !== lastReportId) {
            this.log('Cambio de reporte detectado. Limpiando storage.');
            this.clearFilterMark();
            sessionStorage.setItem('lastReportId', currentReportId);
        }
    },

    checkStatus: function() {
        console.log('=== REPORT AUTO-FILTER STATUS ===');
        console.log('Report ID:', this.config.reportId);
        console.log('Filter already applied:', this.isFilterAlreadyApplied());
        console.log('SessionStorage:', sessionStorage.getItem(this.config.storageKey));
        console.log('Current URL:', window.location.href);
        console.log('================================');
    }
};

// ============================================
// INICIALIZACIÓN AUTOMÁTICA
// ============================================

if (window.location.href.indexOf('/totara/reportbuilder/report.php') !== -1) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('id') === ReportAutoFilter.config.reportId) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => ReportAutoFilter.init(), 300);
            });
        } else {
            setTimeout(() => ReportAutoFilter.init(), 300);
        }

        if (ReportAutoFilter.config.debug) {
            window.reportAutoFilter = {
                clearMark: () => ReportAutoFilter.clearFilterMark(),
                checkStatus: () => ReportAutoFilter.checkStatus()
            };

            console.log('[Report AutoFilter] Debug mode enabled');
            console.log('Use window.reportAutoFilter.checkStatus() to see status');
            console.log('Use window.reportAutoFilter.clearMark() to reset');
        }
    }
}

async function getShortname(courseId) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos

  try {
    const url = `https://apps.ivieducationcloud.com/artefacto/get-shortname.php?courseid=${courseId}`;
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('Error:', data.error);
      return null;
    }

    return data.data.core_course.shortname;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Timeout: La petición tardó demasiado');
    } else {
      console.error('Error:', error);
    }
    return null;
  }
}


/**
** Script para el catálogo.
** añade Requiere Aprobación y los mueve delante
**/
(function () {
  if (!window.location.pathname.includes('/catalog/')) return;

  const CONFIG_URL = 'https://ivirmacampus.com/mod/page/view.php?id=20899';

  // ── Helpers ──────────────────────────────────────────────────────────────

  function isVisible(el) {
    while (el && el !== document.body) {
      if (getComputedStyle(el).display === 'none') return false;
      el = el.parentElement;
    }
    return true;
  }

  function checkConditions() {
    const h3 = document.getElementById('cfp_menu_filtrobloquemla_39281');
    if (!h3) return false;
    if (h3.textContent.trim() !== 'LFE') return false;
    if (!isVisible(h3)) return false;
    return true;
  }

  function getCourseIdFromCard(card) {
    const inner = card.querySelector('[data-redirect-url]');
    if (!inner) return null;
    const match = inner.getAttribute('data-redirect-url').match(/[?&]id=(\d+)/);
    return match ? match[1] : null;
  }

  // ── Leer IDs desde la página de configuración ────────────────────────────

  async function fetchTargetIds() {
    try {
      const res = await fetch(CONFIG_URL, { credentials: 'include' });
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Busca el div .no-overflow que contiene el array de IDs
      const container = doc.querySelector('.no-overflow');
      if (!container) throw new Error('Contenedor de IDs no encontrado');

      // Extrae todos los números del texto: ['1265', '1267', ...]
      const ids = [...container.textContent.matchAll(/\d+/g)].map(m => m[0]);
      if (!ids.length) throw new Error('No se encontraron IDs');

      console.log('[LFE Script] IDs cargados:', ids);
      return ids;
    } catch (e) {
      console.warn('[LFE Script] Error cargando IDs, usando fallback:', e);
      // Fallback hardcodeado por si la página no es accesible
      return ['1265', '1267', '1262', '1264'];
    }
  }

  // ── Lógica principal ─────────────────────────────────────────────────────

  function processCards(targetIds) {
    const grid = document.querySelector('section.tw-grid[role="list"]');
    if (!grid) return;

    const cards = grid.querySelectorAll('[data-tw-grid-item]:not([data-lfe-promoted])');

    cards.forEach(card => {
      const courseId = getCourseIdFromCard(card);
      if (!targetIds.includes(courseId)) return;

      card.setAttribute('data-lfe-promoted', 'true');

      const content = card.querySelector('.tw-catalogItemNarrow__content');
      if (content && !card.querySelector('.etiqueta-obligatorio')) {
        const label = document.createElement('span');
        label.className = 'etiqueta-obligatorio';
        label.textContent = 'Requiere Aprobación';
        const title = content.querySelector('.tw-catalogItemNarrow__title');
        title ? content.insertBefore(label, title) : content.prepend(label);
      }

      grid.prepend(card);
    });
  }

  function observeGrid(targetIds) {
    const grid = document.querySelector('section.tw-grid[role="list"]');
    if (!grid) return;

    const gridObserver = new MutationObserver(() => {
      processCards(targetIds);
    });

    gridObserver.observe(grid, { childList: true });
  }

  // ── Inicialización ───────────────────────────────────────────────────────

  async function runScript() {
    console.log('[LFE Script] ✅ Condiciones cumplidas - cargando IDs...');
    const targetIds = await fetchTargetIds();
    processCards(targetIds);
    observeGrid(targetIds);
  }

  function init() {
    if (checkConditions()) {
      runScript();
      return;
    }

    const observer = new MutationObserver(() => {
      if (checkConditions()) {
        observer.disconnect();
        runScript();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    setTimeout(() => observer.disconnect(), 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();



// ==UserScript==
// @name         IVIRMA - Tutor Dashboard Redirect
// @namespace    https://ivirmacampus.com
// @version      4.3
// @description  Inyecta URL de informe en botón de tutor + aplica búsqueda guardada en el report
// @match        https://ivirmacampus.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(async function () {
    'use strict';

    const TUTOR_TABLE_PAGE = 'https://ivirmacampus.com/mod/page/view.php?id=20645';
    const REPORT_BASE_URL  = 'https://ivirmacampus.com/totara/reportbuilder/report.php';
    const REPORT_ID        = '286';
    const CUSTOM_PARAM     = 'tutorbusqueda';
    const STEP_PARAM       = 'tutorstep';

    const currentUrl   = new URL(window.location.href);
    const isReportPage = currentUrl.pathname.includes('/totara/reportbuilder/report.php')
                      && currentUrl.searchParams.get('id') === REPORT_ID;

    // =====================================================================
    // FASE 2: Estamos en el report con el parámetro custom
    // =====================================================================
    if (isReportPage && currentUrl.searchParams.has(CUSTOM_PARAM)) {
        const tutorValue = currentUrl.searchParams.get(CUSTOM_PARAM);
        const step       = currentUrl.searchParams.get(STEP_PARAM) || '1';

        console.log(`[TutorDashboard] FASE 2 activa. tutorbusqueda="${tutorValue}", step=${step}`);

        // ── Ocultar ambos formularios (con retry por si el DOM tarda) ──
        function hideForms() {
            const f1 = document.getElementById('mform5');
            const f2 = document.getElementById('totara_reportbuilder_viewsavedsearch');
            if (f1) f1.style.display = 'none';
            if (f2) f2.style.display = 'none';
            return !!(f1 && f2);
        }

        if (!hideForms()) {
            const obs = new MutationObserver(() => { if (hideForms()) obs.disconnect(); });
            obs.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => obs.disconnect(), 10000);
        }

        // ── STEP 3: Todo aplicado → modificar tabla ──
        if (step === '3') {
            console.log('[TutorDashboard] Step 3: Búsqueda aplicada. Modificando tabla...');

            function addCompletadosColumn() {
                const table = document.querySelector('table.reportbuilder-table');
                if (!table) return false;

                // Añadir cabecera: después de "Completados" (c1)
                const headerRow = table.querySelector('thead tr');
                if (!headerRow) return false;

                const thCompletados = headerRow.querySelector('th.course_completion_iscomplete');
                if (!thCompletados) return false;

                // Detectar idioma de la cabecera existente
                const existingText = (thCompletados.querySelector('a') || thCompletados).textContent.trim().toLowerCase();
                const colLabel = existingText.includes('completado') ? 'Completados (nº)' : 'Completed (num)';

                const newTh = document.createElement('th');
                newTh.className = 'header course_completion_iscomplete_abs';
                newTh.scope = 'col';
                newTh.innerHTML = `${colLabel}<div class="commands"></div>`;
                // Insertar después de la columna de Completados %
                thCompletados.after(newTh);

                // Añadir celda calculada a cada fila
                const bodyRows = table.querySelectorAll('tbody tr');
                bodyRows.forEach(row => {
                    const cellPct   = row.querySelector('td.course_completion_iscomplete');
                    const cellTotal = row.querySelector('td.user_fullname');
                    if (!cellPct || !cellTotal) return;

                    const pct   = parseFloat(cellPct.textContent.replace('%', '').replace(',', '.')) || 0;
                    const total = parseInt(cellTotal.textContent.replace(/\D/g, ''), 10) || 0;
                    const abs   = Math.round(pct * total / 100);

                    const newTd = document.createElement('td');
                    newTd.className = 'cell course_completion_iscomplete_abs';
                    newTd.textContent = abs.toLocaleString('es-ES');
                    cellPct.after(newTd);
                });

// ── Fila de totales ──
const rows = [...table.querySelectorAll('tbody tr')];

let totalAlumnos = 0;
let sumCompletadosAbs = 0;
let sumEnProgresoAbs = 0;
let sumNoIniciadoAbs = 0;

rows.forEach(row => {
    const pctComp    = parseFloat(row.querySelector('td.course_completion_iscomplete')?.textContent.replace('%','').replace(',','.')) || 0;
    const pctProg    = parseFloat(row.querySelector('td.course_completion_isinprogress')?.textContent.replace('%','').replace(',','.')) || 0;
    const pctNoIni   = parseFloat(row.querySelector('td.course_completion_isnotyetstarted')?.textContent.replace('%','').replace(',','.')) || 0;
    const total      = parseInt(row.querySelector('td.user_fullname')?.textContent.replace(/\D/g,''), 10) || 0;

    totalAlumnos    += total;
    sumCompletadosAbs += Math.round(pctComp  * total / 100);
    sumEnProgresoAbs  += Math.round(pctProg  * total / 100);
    sumNoIniciadoAbs  += Math.round(pctNoIni * total / 100);
});

const pctTotalComp  = totalAlumnos ? (sumCompletadosAbs  / totalAlumnos * 100).toFixed(1) : '0.0';
const pctTotalProg  = totalAlumnos ? (sumEnProgresoAbs   / totalAlumnos * 100).toFixed(1) : '0.0';
const pctTotalNoIni = totalAlumnos ? (sumNoIniciadoAbs   / totalAlumnos * 100).toFixed(1) : '0.0';

const tfoot = document.createElement('tfoot');
tfoot.innerHTML = `
    <tr style="font-weight:600; border-top: 2px solid #ccc;">
        <td class="cell c0">TOTAL</td>
        <td class="cell c1">${pctTotalComp}%</td>
        <td class="cell course_completion_iscomplete_abs">${sumCompletadosAbs.toLocaleString('es-ES')}</td>
        <td class="cell c2">${pctTotalProg}%</td>
        <td class="cell c3">${pctTotalNoIni}%</td>
        <td class="cell c4">${totalAlumnos.toLocaleString('es-ES')}</td>
    </tr>`;
table.appendChild(tfoot);

                console.log('[TutorDashboard] Columna "Completados (nº)" añadida.');

                // Inyectar params custom en todos los enlaces de ordenación de la tabla
                const sortLinks = table.querySelectorAll('thead a[href*="ssort="]');
                sortLinks.forEach(link => {
                    const url = new URL(link.href);
                    url.searchParams.set(CUSTOM_PARAM, tutorValue);
                    url.searchParams.set(STEP_PARAM, '3');
                    link.href = url.toString();
                });
                console.log(`[TutorDashboard] ${sortLinks.length} enlaces de ordenación actualizados.`);

                return true;
            }

            if (!addCompletadosColumn()) {
                const obs4 = new MutationObserver(() => { if (addCompletadosColumn()) obs4.disconnect(); });
                obs4.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => obs4.disconnect(), 10000);
            }

            return;
        }

        // ── STEP 1: Seleccionar búsqueda guardada y enviar su formulario ──
        if (step === '1') {
            function selectSavedSearch() {
                const sidSelect = document.getElementById('id_sid');
                const savedForm = document.getElementById('totara_reportbuilder_viewsavedsearch');
                if (!sidSelect || !savedForm) return false;

                // Buscar opción que coincida con tutorValue
                let matchedSid = null;
                for (const option of sidSelect.options) {
                    if (option.text.trim() === tutorValue) {
                        matchedSid = option.value;
                        break;
                    }
                }

                if (!matchedSid) {
                    console.error(`[TutorDashboard] No se encontró búsqueda guardada para "${tutorValue}".`);
                    return true;
                }

                console.log(`[TutorDashboard] Step 1: Seleccionando sid=${matchedSid}...`);

                // Seleccionar la opción
                sidSelect.value = matchedSid;

                // Modificar action del form para preservar params y avanzar a step 2
                const nextAction = `${REPORT_BASE_URL}?id=${REPORT_ID}&${CUSTOM_PARAM}=${encodeURIComponent(tutorValue)}&${STEP_PARAM}=2`;
                savedForm.action = nextAction;

                // Enviar el formulario
                savedForm.submit();
                return true;
            }

            if (!selectSavedSearch()) {
                const obs2 = new MutationObserver(() => { if (selectSavedSearch()) obs2.disconnect(); });
                obs2.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => obs2.disconnect(), 10000);
            }
            return;
        }

        // ── STEP 2: Búsqueda guardada cargada → clic en "Búsqueda" ──
        if (step === '2') {
            function clickSearch() {
                const searchBtn = document.getElementById('id_submitgroupstandard_addfilter');
                const searchForm = document.getElementById('mform5');
                if (!searchBtn || !searchForm) return false;

                console.log('[TutorDashboard] Step 2: Haciendo clic en Búsqueda...');

                // Modificar action para preservar params y avanzar a step 3
                const nextAction = `${REPORT_BASE_URL}?id=${REPORT_ID}&${CUSTOM_PARAM}=${encodeURIComponent(tutorValue)}&${STEP_PARAM}=3`;
                searchForm.action = nextAction;

                // Clic en Búsqueda
                searchBtn.click();
                return true;
            }

            if (!clickSearch()) {
                const obs3 = new MutationObserver(() => { if (clickSearch()) obs3.disconnect(); });
                obs3.observe(document.body, { childList: true, subtree: true });
                setTimeout(() => obs3.disconnect(), 10000);
            }
            return;
        }

        return;
    }

    // =====================================================================
    // FASE 1: Cualquier página → comprobar tutor e inyectar URL en botón
    // =====================================================================
    const btnFinIns = document.querySelector('a.btn-fin-ins');
    if (!btnFinIns) return;

    const profileLink = document.querySelector('a[href*="user/profile.php?id="]');
    if (!profileLink) return;

    const currentUserId = new URL(profileLink.href).searchParams.get('id');
    if (!currentUserId) return;

    console.log(`[TutorDashboard] FASE 1. Usuario: ${currentUserId}`);

    let doc;
    try {
        const resp = await fetch(TUTOR_TABLE_PAGE, { credentials: 'same-origin' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const html = await resp.text();
        doc = new DOMParser().parseFromString(html, 'text/html');
    } catch (err) {
        console.error('[TutorDashboard] Error al obtener tabla de tutores:', err);
        return;
    }

    const rows = doc.querySelectorAll('.generalbox table tbody tr');
    let searchValue = null;

    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) continue;
        const tutorId  = cells[0].textContent.trim();
        const busqueda = cells[1].textContent.trim();
        if (tutorId === currentUserId) {
            searchValue = busqueda;
            break;
        }
    }

    if (searchValue === null) {
        console.log('[TutorDashboard] Usuario no es tutor.');
        return;
    }

    const targetUrl = `${REPORT_BASE_URL}?id=${REPORT_ID}&${CUSTOM_PARAM}=${encodeURIComponent(searchValue)}`;
    btnFinIns.href = targetUrl;
    console.log(`[TutorDashboard] URL inyectada en .btn-fin-ins → ${targetUrl}`);

})();

(function() {
    'use strict';

    const CONTENT_STYLES = {
        backgroundColor: '#f0f5f680',
        padding: '1em 0.5em 0 1em',
        borderRadius: '12px',
        marginLeft: '0',
        marginTop: '10px'
    };

    const ACTIONS_STYLES = {
        position: 'relative',
        top: '0',
        display: 'inline-flex',
        margin: '5px',
        float: 'none'
    };

    function hasRealDescription(contentAfterLink) {
        const text = contentAfterLink.textContent.replace(/\s+/g, '').trim();
        return text.length > 0;
    }

    function findTargetParagraph(contentAfterLink) {
        // Busca el último <p> con contenido textual real dentro del contentafterlink
        const paragraphs = contentAfterLink.querySelectorAll('p');
        for (let i = paragraphs.length - 1; i >= 0; i--) {
            const text = paragraphs[i].textContent.replace(/\s+/g, '').trim();
            if (text.length > 0) return paragraphs[i];
        }
        return null;
    }

    function processActivity(activity) {
        if (activity.dataset.completionProcessed === 'true') return;

        const contentAfterLink = activity.querySelector('.contentafterlink');
        const actions = activity.querySelector('.actions');
        const checkbox = activity.querySelector('input.completion-icon');
        const autoCompletion = activity.querySelector('.autocompletion');

        if (!contentAfterLink || !actions || !checkbox) return;
        if (autoCompletion) return;
        if (!hasRealDescription(contentAfterLink)) return;

        const targetP = findTargetParagraph(contentAfterLink);
        if (!targetP) return;

        // Insertar .actions dentro del <p>, justo antes del <br> final si existe
        const br = targetP.querySelector('br');
        if (br) {
            targetP.insertBefore(actions, br);
        } else {
            targetP.appendChild(actions);
        }

        Object.assign(contentAfterLink.style, CONTENT_STYLES);
        Object.assign(actions.style, ACTIONS_STYLES);

        activity.dataset.completionProcessed = 'true';
    }

    function processAll() {
        document
            .querySelectorAll('li.activity.resource, li.activity.url')
            .forEach(processActivity);
    }

    function init() {
        processAll();

        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.addedNodes.length > 0) {
                    processAll();
                    break;
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ============================================================
   CATÁLOGO — Filtros colapsables con apertura por defecto
   Los headers (h3) de los filtros no tienen toggle nativo en Totara.
   Este script añade el comportamiento: abiertos por defecto,
   clic en el header para colapsar/expandir.
   ============================================================ */
(function () {
    if (!window.location.pathname.includes('/totara/catalog/')) return;

    function initFilterToggle() {
        var sections = document.querySelectorAll(
            '#page-totara-catalog-index .tw-selectRegionPanel__selector'
        );
        if (!sections.length) return;

        sections.forEach(function (section) {
            var header = section.querySelector('.tw-selectRegionPanel__selector_header');
            var content = section.querySelector('.tw-selectMulti');
            if (!header || !content) return;

            // Evitar doble inicialización
            if (header.dataset.collapseInit) return;
            header.dataset.collapseInit = 'true';

            // Asegurar que empieza abierto
            content.style.overflow = 'hidden';
            content.style.transition = 'max-height 0.25s ease, opacity 0.25s ease';
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';

            // Icono FA chevron (izquierda, sustituye al ">" del tema)
            // Abierto: fa-chevron-right rotado 90° (apunta abajo)
            // Cerrado: fa-chevron-right sin rotar (apunta a la derecha, como ">")
            var icon = document.createElement('i');
            icon.className = 'fa fa-chevron-right neo-filter-arrow';
            icon.setAttribute('aria-hidden', 'true');
            icon.style.cssText = 'margin-right:7px; display:inline-block; transition:transform 0.25s ease; transform:rotate(90deg); font-size:0.75em;';
            header.prepend(icon);

            var isOpen = true;

            header.addEventListener('click', function () {
                isOpen = !isOpen;
                if (isOpen) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.opacity = '1';
                    icon.style.transform = 'rotate(90deg)';
                } else {
                    content.style.maxHeight = '0';
                    content.style.opacity = '0';
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    function renameFiltroBloque() {
        var label = document.querySelector(
            '#page-totara-catalog-index .tw-selectTree__label'
        );
        if (label && label.textContent.trim().toLowerCase().includes('filtro')) {
            label.textContent = 'Filtrar por sección:';
        }
    }

    function schedule() {
        setTimeout(function () { renameFiltroBloque(); initFilterToggle(); }, 400);
        setTimeout(function () { renameFiltroBloque(); initFilterToggle(); }, 1200);
        setTimeout(function () { renameFiltroBloque(); initFilterToggle(); }, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', schedule);
    } else {
        schedule();
    }
})();

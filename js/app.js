const { createApp } = Vue;

const app = createApp({
    data() {
        // Aquestes propietats guarden l'estat actual de la navegació (quina vista es veu),
        // si la barra lateral està plegada, si el menú mòbil està obert, etc.
        return {
            currentView: 'dashboard', // Vista actual
            currentSection: 'dashboard', // Secció principal actual (per exemple: tasks, projects)
            currentSubView: null, // Per a navegació secundària dins d'una secció (per exemple: projects/details)
            sidebarCollapsed: false, // Estat de la barra lateral (plegada o no)
            isMobileMenuOpen: false, // Estat del menú per a mòbils
            breadcrumbs: [], // Per a futures molles de pa (tot i que el computed ho fa)
            message: 'Welcome to time.it!' // Propietat d'exemple
        };
    },
    computed: {
        // Calcula les molles de pa (breadcrumbs) basant-se en la secció i subvista actual.
        // Comença sempre des del 'Dashboard' i afegeix la secció i subvista si cal.
        currentBreadcrumbs() {
            let result = [{ text: 'Dashboard', path: 'dashboard' }];

            if (this.currentSection !== 'dashboard') {
                const sectionLabels = {
                    'tasks': 'My Tasks',
                    'projects': 'Projects',
                    'objectives': 'Objectives',
                    'calendar': 'Calendar',
                    'workspace': 'Workspaces',
                    'progress': 'Progress & Reports',
                    'planner': 'Smart Planner',
                    'settings': 'Settings'
                };

                result.push({
                    text: sectionLabels[this.currentSection] || this.currentSection,
                    path: this.currentSection
                });

                if (this.currentSubView) {
                    result.push({
                        text: this.currentSubView,
                        path: `${this.currentSection}/${this.currentSubView}`
                    });
                }
            }

            return result;
        },

        // Comprova si estem en una pantalla petita (considerada mòbil) segons l'amplada de la finestra.
        isMobile() {
            return window.innerWidth < 992;
        }
    },
    methods: {
        // Canvia la vista actual de l'aplicació, actualitza la secció i subvista,
        // i posa el hash corresponent a l'URL per mantenir l'estat en recarregar la pàgina.
        // També tanca el menú mòbil si està obert.
        setView(viewName, subView = null) {
            this.currentView = viewName;
            this.currentSection = viewName;
            this.currentSubView = subView;

            let hash = `#/${viewName}`;
            if (subView) {
                hash += `/${subView}`;
            }
            
            // Només actualitzem si el hash és diferent per no crear entrades duplicades a l'historial
            if (window.location.hash !== hash) {
                window.location.hash = hash;
            }

            if (this.isMobileMenuOpen) {
                this.toggleMobileMenu();
            }

            console.log(`Switched view to: ${viewName}${subView ? ' / ' + subView : ''}`);
        },

        // Llegeix el hash de l'URL quan la pàgina carrega o quan el hash canvia,
        // i configura la vista, secció i subvista de l'aplicació segons el que trobi.
        parseRoute() {
            // Vista per defecte si el hash està buit
            if (!window.location.hash || window.location.hash === '#') {
                this.setView('dashboard');
                return;
            }

            const path = window.location.hash.substring(1).split('/').filter(segment => segment !== '');
            
            if (path.length > 0) {
                const viewName = path[0] || 'dashboard';
                const subView = path.length > 1 ? path[1] : null;
                
                // Configuramos la vista sin modificar el hash de nuevo para evitar bucles
                this.currentView = viewName;
                this.currentSection = viewName;
                this.currentSubView = subView;
                
                console.log(`Route parsed: view=${viewName}, subView=${subView}`);
            }
        },

        // Plegar o desplegar la barra lateral i guardar la preferència a l'emmagatzematge local
        // del navegador perquè es recordi la propera vegada que es visiti la pàgina.
        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
        },

        // Obre o tanca el menú lateral per a dispositius mòbils.
        // També controla l'overlay i bloqueja el scroll del cos de la pàgina
        // quan el menú està obert per millorar l'experiència d'usuari.
        toggleMobileMenu() {
            this.isMobileMenuOpen = !this.isMobileMenuOpen;

            document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';

            const overlay = document.querySelector('.mobile-overlay');
            if (overlay) {
                overlay.classList.toggle('active', this.isMobileMenuOpen);
            }
        }
    },
    mounted() {
        console.log('Vue app mounted.');

        // Coses que fem just quan l'aplicació es carrega al navegador:
        // 1. Restorem l'estat de la barra lateral des de l'emmagatzematge local.
        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        this.sidebarCollapsed = savedSidebarState === 'true';

        // 2. Configurem un escoltador d'esdeveniments per reaccionar als canvis del hash a l'URL (navegació).
        window.addEventListener('hashchange', this.parseRoute);
        
        // 3. Parsegem la ruta inicial de l'URL per carregar la vista correcta al principi.
        this.parseRoute();

        // 4. Afegim un escoltador per a l'esdeveniment de redimensionar la finestra,
        // útil per tancar el menú mòbil automàticament si la pantalla es fa gran.
        window.addEventListener('resize', () => {
            if (!this.isMobile && this.isMobileMenuOpen) {
                this.isMobileMenuOpen = false;
                document.body.style.overflow = '';

                const overlay = document.querySelector('.mobile-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
            }
        });
    },
    beforeUnmount() {
        // Abans que l'aplicació es destrueixi, eliminem els escoltadors d'esdeveniments
        // que vam crear al 'mounted' per netejar i evitar possibles problemes de memòria.
        window.removeEventListener('hashchange', this.parseRoute);
        window.removeEventListener('resize', this.handleResize);
    }
});

// Aquí registrem tots els components principals que farem servir a l'aplicació globalment.
// Suposem que SmartPlanner, TeamWorkspace, etc. estan definits en altres llocs i disponibles.
app.component('smart-planner', SmartPlanner);
app.component('team-workspace', TeamWorkspace);
app.component('projects-view', ProjectsView);
app.component('progress-report', ProgressReport);
app.component('dashboard-view', DashboardView);
app.component('tasks-view', TasksView);
app.component('objectives-view', ObjectivesView);
app.component('calendar-view', CalendarView);
app.component('settings-view', SettingsView);

// Afegim un mètode global a l'aplicació (`$navigateTo`) que qualsevol component
// podrà fer servir per canviar de vista fàcilment sense haver de cridar directament `setView`.
app.config.globalProperties.$navigateTo = function(viewName, subView = null) {
    this.setView(viewName, subView);
};

app.mount('#app');
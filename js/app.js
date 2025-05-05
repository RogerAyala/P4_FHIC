const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            // Controls which component/view is currently displayed
            currentView: 'dashboard', // Default view
            currentSection: 'dashboard', // Current main section
            currentSubView: null, // For secondary navigation
            sidebarCollapsed: false, // Track sidebar state
            isMobileMenuOpen: false, // Track mobile menu state
            breadcrumbs: [], // For breadcrumb navigation
            message: 'Welcome to time.it!' // Example data property
        };
    },
    computed: {
        // Generate breadcrumbs based on current view
        currentBreadcrumbs() {
            let result = [{ text: 'Dashboard', path: 'dashboard' }];

            if (this.currentSection !== 'dashboard') {
                // Add section level breadcrumb
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

                // Add subview if exists
                if (this.currentSubView) {
                    result.push({
                        text: this.currentSubView,
                        path: `${this.currentSection}/${this.currentSubView}`
                    });
                }
            }

            return result;
        },

        // Determine if we're on a mobile device
        isMobile() {
            return window.innerWidth < 992;
        }
    },
    methods: {
        setView(viewName, subView = null) {
            this.currentView = viewName;
            this.currentSection = viewName;
            this.currentSubView = subView;

            // Update URL hash to reflect current view
            let hash = `#/${viewName}`;
            if (subView) {
                hash += `/${subView}`;
            }
            
            // Only update if the hash is different to avoid duplicate history entries
            if (window.location.hash !== hash) {
                window.location.hash = hash;
            }

            // Close mobile menu if open
            if (this.isMobileMenuOpen) {
                this.toggleMobileMenu();
            }

            console.log(`Switched view to: ${viewName}${subView ? ' / ' + subView : ''}`);
        },

        // Parse URL hash to set the correct view
        parseRoute() {
            // Default view if hash is empty
            if (!window.location.hash || window.location.hash === '#') {
                this.setView('dashboard');
                return;
            }

            // Remove the # and split by /
            const path = window.location.hash.substring(1).split('/').filter(segment => segment !== '');
            
            if (path.length > 0) {
                const viewName = path[0] || 'dashboard';
                const subView = path.length > 1 ? path[1] : null;
                
                // Set view without updating URL again (to avoid recursion)
                this.currentView = viewName;
                this.currentSection = viewName;
                this.currentSubView = subView;
                
                console.log(`Route parsed: view=${viewName}, subView=${subView}`);
            }
        },

        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            // Save preference to localStorage
            localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
        },

        toggleMobileMenu() {
            this.isMobileMenuOpen = !this.isMobileMenuOpen;

            // Toggle body scroll when menu is open
            document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';

            // Handle overlay
            const overlay = document.querySelector('.mobile-overlay');
            if (overlay) {
                overlay.classList.toggle('active', this.isMobileMenuOpen);
            }
        }
    },
    mounted() {
        console.log('Vue app mounted.');

        // Restore sidebar preference
        const savedSidebarState = localStorage.getItem('sidebarCollapsed');
        this.sidebarCollapsed = savedSidebarState === 'true';

        // Set up hash-based navigation
        window.addEventListener('hashchange', this.parseRoute);
        
        // Initial route parsing
        this.parseRoute();

        // Handle resize events for responsive behavior
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
        // Clean up event listeners
        window.removeEventListener('hashchange', this.parseRoute);
        window.removeEventListener('resize', this.handleResize);
    }
});

// Register components (will be defined in separate files)
app.component('smart-planner', SmartPlanner);
app.component('team-workspace', TeamWorkspace);
app.component('projects-view', ProjectsView);
app.component('progress-report', ProgressReport);

app.mount('#app');

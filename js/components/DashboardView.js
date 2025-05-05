window.DashboardView = {
    template: `
        <div class="dashboard-view animate__animated animate__fadeIn">
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="m-0">Welcome Back</h5>
                            <span class="badge bg-primary">{{ currentDate }}</span>
                        </div>
                        <div class="card-body">
                            <h2 class="mb-4">Good morning, User!</h2>
                            <p class="lead mb-4">Here's what's on your schedule today:</p>
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h6 class="mb-2">Tasks Due</h6>
                                    <span class="display-5 fw-bold text-primary">{{ dueTasks }}</span>
                                </div>
                                <div>
                                    <h6 class="mb-2">Meetings</h6>
                                    <span class="display-5 fw-bold text-info">{{ meetings }}</span>
                                </div>
                                <div>
                                    <h6 class="mb-2">Priority</h6>
                                    <span class="display-5 fw-bold text-danger">{{ priority }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-light">
                            <a href="#" class="btn btn-primary" @click.prevent="navigateTo('tasks')">View My Tasks</a>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="m-0">Project Status</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <span class="fw-medium">{{ projects[0].name }}</span>
                                <span class="badge" :class="getProjectStatusClass(projects[0])">{{ projects[0].status }}</span>
                            </div>
                            <div class="progress mb-4" style="height: 8px;">
                                <div class="progress-bar" :class="getProjectBarClass(projects[0])" role="progressbar" 
                                    :style="{ width: projects[0].progress + '%' }"
                                    :aria-valuenow="projects[0].progress" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>

                            <div class="d-flex justify-content-between mb-3">
                                <span class="fw-medium">{{ projects[1].name }}</span>
                                <span class="badge" :class="getProjectStatusClass(projects[1])">{{ projects[1].status }}</span>
                            </div>
                            <div class="progress mb-4" style="height: 8px;">
                                <div class="progress-bar" :class="getProjectBarClass(projects[1])" role="progressbar" 
                                    :style="{ width: projects[1].progress + '%' }"
                                    :aria-valuenow="projects[1].progress" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>

                            <div class="d-flex justify-content-between mb-3">
                                <span class="fw-medium">{{ projects[2].name }}</span>
                                <span class="badge" :class="getProjectStatusClass(projects[2])">{{ projects[2].status }}</span>
                            </div>
                            <div class="progress" style="height: 8px;">
                                <div class="progress-bar" :class="getProjectBarClass(projects[2])" role="progressbar" 
                                    :style="{ width: projects[2].progress + '%' }"
                                    :aria-valuenow="projects[2].progress" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                        <div class="card-footer bg-light">
                            <a href="#" class="btn btn-outline-primary" @click.prevent="navigateTo('projects')">View Projects</a>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="m-0">Quick Actions</h5>
                        </div>
                        <div class="card-body p-0">
                            <div class="row g-0">
                                <div class="col-md-3 border-end p-4 text-center">
                                    <a href="#" class="text-decoration-none" @click.prevent="navigateTo('tasks')">
                                        <div class="quick-action-icon mb-3">
                                            <i class="bi bi-plus-circle"></i>
                                        </div>
                                        <h6 class="fw-semibold">Add Task</h6>
                                    </a>
                                </div>
                                <div class="col-md-3 border-end p-4 text-center">
                                    <a href="#" class="text-decoration-none" @click.prevent="navigateTo('projects')">
                                        <div class="quick-action-icon mb-3">
                                            <i class="bi bi-folder-plus"></i>
                                        </div>
                                        <h6 class="fw-semibold">New Project</h6>
                                    </a>
                                </div>
                                <div class="col-md-3 border-end p-4 text-center">
                                    <a href="#" class="text-decoration-none" @click.prevent="navigateTo('calendar')">
                                        <div class="quick-action-icon mb-3">
                                            <i class="bi bi-calendar-plus"></i>
                                        </div>
                                        <h6 class="fw-semibold">Schedule Meeting</h6>
                                    </a>
                                </div>
                                <div class="col-md-3 p-4 text-center">
                                    <a href="#" class="text-decoration-none" @click.prevent="navigateTo('planner')">
                                        <div class="quick-action-icon mb-3">
                                            <i class="bi bi-magic"></i>
                                        </div>
                                        <h6 class="fw-semibold">Smart Plan</h6>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        // Aquí definim les dades inicials del component, com el nombre de tasques pendents, reunions,
        // la prioritat i una llista de projectes amb el seu estat i progrés.
        return {
            dueTasks: 3,
            meetings: 2,
            priority: 'Urgent',
            projects: [
                { name: 'Project Alpha', status: 'On Track', progress: 75 },
                { name: 'Website Redesign', status: 'Delayed', progress: 45 },
                { name: 'API Integration', status: 'At Risk', progress: 30 }
            ]
        };
    },
    computed: {
        // Aquesta propietat computada calcula la data actual per mostrar-la a la capçalera.
        currentDate() {
            return new Date().toLocaleDateString();
        }
    },
    methods: {
        // Aquesta funció s'encarrega de navegar a una altra vista quan es fa clic en un enllaç.
        // Emet un esdeveniment 'navigate' amb la vista i possiblement una subvista.
        navigateTo(view, subview = null) {
            this.$emit('navigate', view, subview);
        },
        // Aquesta funció retorna la classe CSS de Bootstrap adequada per al badge d'estat d'un projecte.
        getProjectStatusClass(project) {
            switch (project.status) {
                case 'On Track': return 'bg-success';
                case 'Delayed': return 'bg-warning';
                case 'At Risk': return 'bg-danger';
                default: return 'bg-secondary';
            }
        },
        // Aquesta funció retorna la classe CSS de Bootstrap adequada per a la barra de progrés d'un projecte.
        getProjectBarClass(project) {
            switch (project.status) {
                case 'On Track': return 'bg-success';
                case 'Delayed': return 'bg-warning';
                case 'At Risk': return 'bg-danger';
                default: return 'bg-secondary';
            }
        }
    },
    mounted() {
        // Aquesta funció s'executa quan el component de la vista de dashboard s'ha muntat al DOM.
        // Mostra un missatge a la consola per indicar que s'ha carregat correctament.
        console.log('Dashboard view component mounted.');
    }
};
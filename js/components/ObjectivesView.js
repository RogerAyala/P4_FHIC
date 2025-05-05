window.ObjectivesView = {
    template: `
        <div class="objectives-view animate__animated animate__fadeIn">
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between">
                    <h5 class="m-0">Objectives & Key Results (OKRs)</h5>
                    <button class="btn btn-sm btn-primary" @click="openNewObjectiveModal">
                        <i class="bi bi-plus"></i> Add Objective
                    </button>
                </div>
                <div class="card-body">
                    <div class="mb-5">
                        <h5 class="mb-3">Q2 2025 Objectives</h5>
                        <div v-for="objective in objectives" :key="objective.id" class="objective-item mb-4">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="m-0">{{ objective.title }}</h6>
                                <span class="badge" :class="getProgressClass(objective.progress)">{{ objective.progress }}% Complete</span>
                            </div>
                            <div class="progress mb-3" style="height: 10px;">
                                <div class="progress-bar" :class="getProgressClass(objective.progress)" role="progressbar"
                                     :style="{ width: objective.progress + '%' }"
                                     :aria-valuenow="objective.progress" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <ul class="list-group list-group-flush">
                                <li v-for="(kr, index) in objective.keyResults" :key="index"
                                    class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <input class="form-check-input me-2" type="checkbox"
                                               v-model="kr.completed" @change="updateProgress(objective)">
                                        <span>{{ kr.title }}</span>
                                    </div>
                                    <span class="badge" :class="kr.completed ? 'bg-secondary' : 'bg-warning'">
                                        {{ kr.completed ? 'Complete' : 'In Progress' }}
                                    </span>
                                </li>
                            </ul>
                            <div class="mt-3">
                                <button class="btn btn-sm btn-outline-primary" @click="editObjective(objective)">
                                    <i class="bi bi-pencil me-1"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-outline-secondary ms-2" @click="addKeyResult(objective)">
                                    <i class="bi bi-plus me-1"></i> Add KR
                                </button>
                            </div>
                        </div>

                        <!-- Placeholder per quan no hi ha objectius -->
                        <div class="text-center p-4 border border-dashed rounded">
                            <i class="bi bi-plus-circle text-primary fs-4 mb-2"></i>
                            <p class="mb-0 text-muted">Clica 'Add Objective' per crear un nou OKR</p>
                        </div>
                    </div>

                    <!-- Botó per alternar la visualització d'objectius històrics -->
                    <div class="mt-4">
                        <button class="btn btn-outline-secondary" @click="toggleHistorical">
                            <i class="bi" :class="showHistorical ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                            {{ showHistorical ? 'Amaga' : 'Mostra' }} Objectius Passats
                        </button>
                    </div>

                    <!-- Contingut dels objectius històrics -->
                    <div v-if="showHistorical" class="historical-objectives mt-4 pt-3 border-top">
                        <h5 class="mb-3">Q1 2025 Objectives</h5>
                        <div class="objective-item mb-4">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="m-0">Increase Market Share</h6>
                                <span class="badge bg-success">100% Complete</span>
                            </div>
                            <div class="progress mb-3" style="height: 10px;">
                                <div class="progress-bar bg-success" role="progressbar" style="width: 100%"
                                     aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <p class="text-muted">Aquest objectiu es va completar amb èxit al Q1 2025.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            // Controla si es mostren els objectius històrics
            showHistorical: false,
            // Array amb les dades dels objectius actuals i els seus resultats clau
            objectives: [
                {
                    id: 1,
                    title: 'Improve User Satisfaction',
                    progress: 70, // Progrés calculat
                    keyResults: [ // Llista de resultats clau associats a l'objectiu
                        {
                            title: 'Reduce support ticket response time to 2 hours',
                            completed: true // Estat de compleció del resultat clau
                        },
                        {
                            title: 'Implement new user onboarding flow',
                            completed: true
                        },
                        {
                            title: 'Achieve customer satisfaction score of 4.5/5',
                            completed: false
                        }
                    ]
                },
                {
                    id: 2,
                    title: 'Boost Team Productivity',
                    progress: 45,
                    keyResults: [
                        {
                            title: 'Implement automated testing framework',
                            completed: true
                        },
                        {
                            title: 'Reduce meeting time by 20%',
                            completed: false
                        },
                        {
                            title: 'Achieve 90% sprint completion rate',
                            completed: false
                        }
                    ]
                }
            ]
        };
    },
    methods: {
        // Determina la classe CSS de la barra de progrés i el badge segons el percentatge
        getProgressClass(progress) {
            if (progress >= 100) return 'bg-success';
            if (progress >= 70) return 'bg-success';
            if (progress >= 40) return 'bg-warning';
            return 'bg-danger';
        },
        // Actualitza el progrés d'un objectiu basant-se en els resultats clau completats
        updateProgress(objective) {
            const completed = objective.keyResults.filter(kr => kr.completed).length;
            const total = objective.keyResults.length;
            objective.progress = Math.round((completed / total) * 100);
            console.log(`Progress actualitzat per "${objective.title}" al ${objective.progress}%`);
        },
        // Mètode per navegar (emissió d'esdeveniment al component pare)
        navigateTo(view, subview = null) {
            this.$emit('navigate', view, subview);
        },
        // Canvia l'estat de visualització dels objectius històrics
        toggleHistorical() {
            this.showHistorical = !this.showHistorical;
        },
        // Funció per obrir un modal o formulari per crear un nou objectiu
        openNewObjectiveModal() {
            console.log('Obrint modal per nou objectiu');
            alert('Funció fora dels escencaris de ús');
        },
        // Funció per editar un objectiu existent
        editObjective(objective) {
            console.log('Editant objectiu:', objective.id);
            alert('Funció fora dels escencaris de ús');
        },
        // Funció per afegir un nou resultat clau a un objectiu
        addKeyResult(objective) {
            console.log('Afegint resultat clau a objectiu:', objective.id);
            const newKR = { title: 'Nou resultat clau', completed: false };
            objective.keyResults.push(newKR);
            this.updateProgress(objective); // Recalcula el progrés després d'afegir un KR
        }
    },
    // Hook de cicle de vida que s'executa quan el component ha estat muntat al DOM
    mounted() {
        console.log('Component de vista d\'objectius muntat.');
    }
};
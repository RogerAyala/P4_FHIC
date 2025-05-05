// js/components/SmartPlanner.js

window.SmartPlanner = {
    template: `
        <div class="smart-planner-view container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Planificador intel·ligent d'estudi/projecte</h2>
                <div class="d-flex align-items-center">
                    <button class="btn btn-outline-primary" @click="generatePlan" :disabled="generating || items.length === 0">
                        <i class="bi bi-magic me-2"></i> Generar pla
                    </button>
                </div>
            </div>
            <p class="lead text-muted mb-4">Introdueix les teves assignatures o projectes, defineix paràmetres i obtén un horari optimitzat per IA.</p>

            <!-- Fase d'entrada -->
            <div class="card mb-5 border-0 shadow-sm">
                <div class="card-header bg-primary text-white">
                    <i class="bi bi-plus-circle me-2"></i> Afegir assignatures/projectes
                </div>
                <div class="card-body">
                    <form @submit.prevent="addItem" class="mb-4">
                        <div class="row g-3 align-items-end">
                            <div class="col-md-4">
                                <label for="itemName" class="form-label fw-medium">Nom de l'assignatura/projecte</label>
                                <input type="text" class="form-control" id="itemName" v-model="newItem.name" required>
                            </div>
                            <div class="col-md-3">
                                <label for="itemDeadline" class="form-label fw-medium">Data límit</label>
                                <input type="date" class="form-control" id="itemDeadline" v-model="newItem.deadline" required>
                            </div>
                            <div class="col-md-3">
                                <div class="d-flex justify-content-between">
                                    <label for="itemDifficulty" class="form-label fw-medium">Dificultat</label>
                                    <span class="text-primary fw-bold">{{ newItem.difficulty }}</span>
                                </div>
                                <input type="range" class="form-range" id="itemDifficulty" min="1" max="10" v-model.number="newItem.difficulty" required>
                                <div class="d-flex justify-content-between small text-muted">
                                    <span>Fàcil</span>
                                    <span>Difícil</span>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="bi bi-plus-lg me-1"></i> Afegir
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    <!-- Llista d'elements -->
                    <h5 class="mb-3" v-if="items.length > 0">
                        <i class="bi bi-list-check me-2"></i> Elements afegits
                        <span class="badge bg-primary ms-2">{{ items.length }}</span>
                    </h5>
                    <div class="table-responsive" v-if="items.length > 0">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Nom</th>
                                    <th>Data límit</th>
                                    <th>Dificultat</th>
                                    <th class="text-end">Accions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in items" :key="index" class="align-middle">
                                    <td class="fw-medium">{{ item.name }}</td>
                                    <td>{{ formatDate(item.deadline) }}</td>
                                    <td>
                                        <div class="progress" style="height: 8px;" :title="item.difficulty + ' de 10'">
                                            <div class="progress-bar" role="progressbar" 
                                                 :style="{ width: (item.difficulty * 10) + '%', 
                                                         backgroundColor: getDifficultyColor(item.difficulty) }" 
                                                 :aria-valuenow="item.difficulty" aria-valuemin="0" aria-valuemax="10">
                                            </div>
                                        </div>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-danger" @click="removeItem(index)">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p v-else class="text-center text-muted py-3">
                        <i class="bi bi-info-circle me-1"></i> Encara no s'ha afegit cap element. Afegeix la teva primera assignatura o projecte a dalt.
                    </p>
                </div>
                <div class="card-footer bg-light text-end" v-if="items.length > 0">
                    <button class="btn btn-secondary me-2" @click="clearAll">
                        <i class="bi bi-x-lg me-1"></i> Esborrar tot
                    </button>
                    <button class="btn btn-primary" @click="generatePlan" :disabled="generating">
                        <span v-if="generating" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <i v-else class="bi bi-magic me-1"></i>
                        {{ generating ? 'Generant...' : 'Generar pla d\\'estudi' }}
                    </button>
                </div>
            </div>

            <!-- Visualització del pla generat per IA -->
            <div v-if="planGenerated" class="generated-plan animate__animated animate__fadeIn">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-success text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h3 class="m-0">
                                <i class="bi bi-calendar2-check me-2"></i> El teu horari optimitzat
                            </h3>
                            <div>
                                <button class="btn btn-sm btn-outline-light me-2">
                                    <i class="bi bi-download me-1"></i> Exportar
                                </button>
                                <button class="btn btn-sm btn-outline-light">
                                    <i class="bi bi-pencil me-1"></i> Editar
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">Pla generat per IA basat en les teves entrades. Fes clic als blocs per interactuar amb ells.</p>
                        
                        <!-- Visualització del calendari setmanal (exemple/mockup) -->
                        <div class="calendar-view p-3 bg-light rounded mb-3">
                            <h6 class="text-center mb-3">Aquesta setmana (24-30 d'abril de 2025)</h6>
                            <div class="row g-2">
                                <div v-for="day in ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']" :key="day" class="col">
                                    <div class="day-column">
                                        <div class="day-header text-center py-2 bg-primary text-white rounded-top small fw-bold">{{ day }}</div>
                                        <div class="day-body bg-white border rounded-bottom p-1" style="min-height: 200px;">
                                            <!-- Exemple de blocs d'horari -->
                                            <div v-if="day === 'Dc'" class="schedule-block bg-primary-light text-dark p-2 rounded mb-1 small" @click="simulateAction('Editar bloc')">
                                                {{ items[0]?.name || "Sessió d'estudi" }}
                                                <div class="text-muted smaller">14:00-16:00</div>
                                            </div>
                                            <div v-if="day === 'Dj'" class="schedule-block bg-secondary text-white p-2 rounded mb-1 small" @click="simulateAction('Editar bloc')">
                                                {{ items.length > 1 ? items[1].name : "Treball de projecte" }}
                                                <div class="text-white-50 smaller">10:00-12:00</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Estat d'integració del calendari -->
                        <div class="d-flex align-items-center mb-2">
                            <div class="bg-success rounded-circle p-1 me-2"><i class="bi bi-check-lg text-white"></i></div>
                            <span>Sincronitzat amb Google Calendar</span>
                            <button class="btn btn-sm btn-link">Configurar</button>
                        </div>
                    </div>
                </div>

                <!-- Anàlisi de focus d'estudi/projecte -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-header bg-info text-white">
                                <i class="bi bi-graph-up me-2"></i> Distribució del focus
                            </div>
                            <div class="card-body text-center">
                                <div class="text-muted mb-3">(La visualització de l'assignació de temps apareixeria aquí)</div>
                                <div class="study-focus-mock p-3 bg-light rounded">
                                    <div class="d-flex mb-2">
                                        <div class="flex-grow-1 text-start">{{ items[0]?.name || "Assignatura 1" }}</div>
                                        <div class="flex-shrink-0 text-end fw-medium">45%</div>
                                    </div>
                                    <div class="progress mb-3" style="height: 10px;">
                                        <div class="progress-bar bg-primary" role="progressbar" style="width: 45%" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    
                                    <div class="d-flex mb-2">
                                        <div class="flex-grow-1 text-start">{{ items.length > 1 ? items[1].name : "Assignatura 2" }}</div>
                                        <div class="flex-shrink-0 text-end fw-medium">30%</div>
                                    </div>
                                    <div class="progress mb-3" style="height: 10px;">
                                        <div class="progress-bar bg-warning" role="progressbar" style="width: 30%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    
                                    <div class="d-flex mb-2">
                                        <div class="flex-grow-1 text-start">{{ items.length > 2 ? items[2].name : "Assignatura 3" }}</div>
                                        <div class="flex-shrink-0 text-end fw-medium">25%</div>
                                    </div>
                                    <div class="progress" style="height: 10px;">
                                        <div class="progress-bar bg-success" role="progressbar" style="width: 25%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-header bg-warning text-dark">
                                <i class="bi bi-lightbulb me-2"></i> Recomanacions de IA
                            </div>
                            <div class="card-body">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex align-items-start border-0 ps-0">
                                        <i class="bi bi-star-fill text-warning me-2 mt-1"></i>
                                        <div>
                                            <strong>Prioritza {{ items[0]?.name || "Projecte 1" }}</strong>: A causa de la data límit propera i l'alt nivell de dificultat.
                                        </div>
                                    </li>
                                    <li class="list-group-item d-flex align-items-start border-0 ps-0">
                                        <i class="bi bi-clock-history text-primary me-2 mt-1"></i>
                                        <div>
                                            <strong>Millor hora de concentració</strong>: Programa treball profund per al {{ items.length > 1 ? items[1].name : "Projecte 2" }} al matí.
                                        </div>
                                    </li>
                                    <li class="list-group-item d-flex align-items-start border-0 ps-0">
                                        <i class="bi bi-heart-pulse text-danger me-2 mt-1"></i>
                                        <div>
                                            <strong>Nota de benestar</strong>: Recorda programar pauses entre sessions d'estudi per a una retenció òptima.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Notificacions i recordatoris -->
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-primary-light text-dark">
                        <i class="bi bi-bell me-2"></i> Notificacions i recordatoris
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush">
                            <div class="list-group-item d-flex align-items-center border-start-0 border-end-0">
                                <div class="flex-shrink-0">
                                    <div class="notification-icon bg-primary text-white rounded-circle p-2">
                                        <i class="bi bi-calendar-event"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Sessió d'estudi propera</h6>
                                        <small>Avui, 14:00</small>
                                    </div>
                                    <p class="mb-1 small">{{ items[0]?.name || "Assignatura" }} sessió d'estudi programada</p>
                                </div>
                                <div class="flex-shrink-0 ms-2">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="notif1" checked>
                                    </div>
                                </div>
                            </div>
                            <div class="list-group-item d-flex align-items-center border-start-0 border-end-0">
                                <div class="flex-shrink-0">
                                    <div class="notification-icon bg-warning text-dark rounded-circle p-2">
                                        <i class="bi bi-emoji-smile"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Recordatori de benestar</h6>
                                        <small>Cada hora</small>
                                    </div>
                                    <p class="mb-1 small">Fes una pausa curta de 5 minuts per estirar-te</p>
                                </div>
                                <div class="flex-shrink-0 ms-2">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="notif2" checked>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-light">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">Preferències de notificació</span>
                            <button class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-gear me-1"></i> Configurar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            newItem: {
                name: '',
                deadline: '',
                difficulty: 5,
            },
            items: [], // Array per mantenir assignatures/projectes
            generating: false,
            planGenerated: false,
        };
    },
    methods: {
        addItem() {
            if (this.newItem.name && this.newItem.deadline) {
                this.items.push({ ...this.newItem });
                // Restablir el formulari
                this.newItem.name = '';
                this.newItem.deadline = '';
                this.newItem.difficulty = 5;
            }
        },
        removeItem(index) {
            this.items.splice(index, 1);
            // Si s'eliminen elements, potser restablir el pla generat
            if (this.items.length === 0) {
                this.planGenerated = false;
            }
        },
        clearAll() {
            this.items = [];
            this.planGenerated = false;
        },
        generatePlan() {
            if (this.items.length === 0) return;
            this.generating = true;
            this.planGenerated = false;
            console.log("Simulant generació de pla per IA amb elements:", this.items);
            // Simular trucada API o lògica complexa
            setTimeout(() => {
                this.generating = false;
                this.planGenerated = true;
                console.log("Generació de pla completada (simulada).");
            }, 1500); // Simular retard
        },
        simulateAction(action) {
            console.log("Acció simulada:", action);
            // En una aplicació real, això activaria modals, actualitzaria dades, etc.
            alert(`Acció: ${action}`);
        },
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString + 'T00:00:00'); // Evitar problemes de zona horària
                return new Intl.DateTimeFormat('ca-ES', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }).format(date);
            } catch (e) {
                return dateString;
            }
        },
        getDifficultyColor(difficulty) {
            if (difficulty <= 3) return 'var(--success)';
            if (difficulty <= 6) return 'var(--warning)';
            return 'var(--danger)';
        }
    }
};

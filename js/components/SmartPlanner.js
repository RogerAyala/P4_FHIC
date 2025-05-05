// js/components/SmartPlanner.js

// Aquest component mostra el planificador intel·ligent de tasques. Aquí es gestionen les llistes de tasques, la generació d'un pla setmanal i les recomanacions AI. També es mostren notificacions i recordatoris.
window.SmartPlanner = {
    template: `
        <div class="smart-planner-view container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Smart Task Planner</h2>
                <button class="btn btn-outline-primary" @click="generatePlan" :disabled="generating || tasks.length === 0">
                    <i class="bi bi-magic me-2"></i> Generate Plan
                </button>
            </div>
            <p class="lead text-muted mb-4">This planner uses your project tasks to create an optimized schedule.</p>

            <!-- Tasks List -->
            <div class="card mb-5 border-0 shadow-sm">
                <div class="card-header text-black">
                    <i class="bi bi-list-check me-2"></i> Project Tasks
                </div>
                <div class="card-body">
                    <h5 class="mb-3" v-if="tasks.length > 0">
                        <i class="bi bi-list-check me-2"></i> Total Tasks
                        <span class="badge bg-primary ms-2">{{ tasks.length }}</span>
                    </h5>
                    <div class="table-responsive" v-if="tasks.length > 0">
                        <table class="table table-hover align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Task</th>
                                    <th>Project</th>
                                    <th>Deadline</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="task in tasks" :key="task.id">
                                    <td>{{ task.title }}</td>
                                    <td>{{ getProject(task.projectId)?.title || '—' }}</td>
                                    <td>{{ formatDate(task.deadline) }}</td>
                                    <td><span :class="['badge', getPriorityClass(task.priority)]">{{ task.priority }}</span></td>
                                    <td>{{ task.status }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p v-else class="text-center text-muted py-3">
                        <i class="bi bi-info-circle me-1"></i> No tasks available.
                    </p>
                </div>
                <div class="card-footer bg-light text-end">
                    <button class="btn btn-primary" @click="generatePlan" :disabled="generating">
                        <span v-if="generating" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        <i v-else class="bi bi-magic me-1"></i>
                        {{ generating ? 'Generating...' : 'Generate Plan' }}
                    </button>
                </div>
            </div>

            <!-- AI Generated Plan View -->
            <div v-if="planGenerated" class="generated-plan animate__animated animate__fadeIn">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header text-white">
                        <div class="d-flex justify-content-between align-items-center">
                            <h3 class="m-0">
                                <i class="bi bi-calendar2-check me-2"></i> Your Optimized Schedule
                            </h3>
                            <div>
                                <button class="btn btn-sm btn-outline-light me-2">
                                    <i class="bi bi-download me-1"></i> Export
                                </button>
                                <button class="btn btn-sm btn-outline-light">
                                    <i class="bi bi-pencil me-1"></i> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="text-muted">AI-generated plan based on your inputs. Click on schedule blocks to interact with them.</p>
                        
                        <!-- Weekly Calendar View -->
                        <div class="calendar-view p-3 bg-light rounded mb-3">
                            <h6 class="text-center mb-3">This Week (May 5-11, 2025)</h6>
                            <div class="row g-2">
                                <div v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day" class="col">
                                    <div class="day-column">
                                        <div class="day-header text-center py-2 bg-primary text-white rounded-top small fw-bold">{{ day }}</div>
                                        <div class="day-body bg-white border rounded-bottom p-1" style="min-height: 200px;">
                                            <!-- Example schedule blocks -->
                                            <div v-if="day === 'Mon'" class="schedule-block bg-primary-light text-dark p-2 rounded mb-1 small" @click="simulateAction('Edit block')">
                                                {{ tasks[0]?.title || "Advanced Machine Learning" }}
                                                <div class="text-muted smaller">09:00-11:00</div>
                                            </div>
                                            <div v-if="day === 'Wed'" class="schedule-block bg-primary-light text-dark p-2 rounded mb-1 small" @click="simulateAction('Edit block')">
                                                {{ tasks[0]?.title || "Advanced Machine Learning" }}
                                                <div class="text-muted smaller">14:00-16:00</div>
                                            </div>
                                            <div v-if="day === 'Thu'" class="schedule-block bg-secondary text-white p-2 rounded mb-1 small" @click="simulateAction('Edit block')">
                                                {{ tasks.length > 1 ? tasks[1].title : "Web App Development" }}
                                                <div class="text-white-50 smaller">10:00-12:00</div>
                                            </div>
                                            <div v-if="day === 'Fri'" class="schedule-block bg-secondary text-white p-2 rounded mb-1 small" @click="simulateAction('Edit block')">
                                                {{ tasks.length > 1 ? tasks[1].title : "Web App Development" }}
                                                <div class="text-white-50 smaller">15:00-17:00</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Calendar Integration Status -->
                        <div class="d-flex align-items-center mb-2">
                            <div class="bg-success rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style="width: 24px; height: 24px;"><i class="bi bi-check-lg text-white"></i></div>
                            <span>Synchronized with Google Calendar</span>
                            <button class="btn btn-sm btn-link">Configure</button>
                        </div>
                    </div>
                </div>

                <!-- Study Focus Analysis -->
                <div class="row g-4 mb-4">
                    <div class="col-md-6">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-header text-dark">
                                <i class="bi bi-graph-up me-2"></i> Focus Distribution
                            </div>
                            <div class="card-body text-center">
                                <div class="study-focus-mock p-3 bg-light rounded">
                                    <div class="d-flex mb-2">
                                        <div class="flex-grow-1 text-start">{{ tasks[0]?.title || "Advanced Machine Learning" }}</div>
                                        <div class="flex-shrink-0 text-end fw-medium">45%</div>
                                    </div>
                                    <div class="progress mb-3" style="height: 10px;">
                                        <div class="progress-bar bg-primary" role="progressbar" style="width: 45%" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    
                                    <div class="d-flex mb-2">
                                        <div class="flex-grow-1 text-start">{{ tasks.length > 1 ? tasks[1].title : "Web App Development" }}</div>
                                        <div class="flex-shrink-0 text-end fw-medium">30%</div>
                                    </div>
                                    <div class="progress mb-3" style="height: 10px;">
                                        <div class="progress-bar bg-warning" role="progressbar" style="width: 30%" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                                    </div>
                                    
                                    <div class="d-flex mb-2">
                                        <div class="flex-grow-1 text-start">{{ tasks.length > 2 ? tasks[2].title : "UX Research Methods" }}</div>
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
                            <div class="card-header text-dark">
                                <i class="bi bi-lightbulb me-2"></i> AI Recommendations
                            </div>
                            <div class="card-body">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex align-items-start border-0 ps-0">
                                        <i class="bi bi-star-fill text-warning me-2 mt-1"></i>
                                        <div>
                                            <strong>Prioritize {{ tasks[0]?.title || "Advanced Machine Learning" }}</strong>: Due to upcoming deadline and high complexity level.
                                        </div>
                                    </li>
                                    <li class="list-group-item d-flex align-items-start border-0 ps-0">
                                        <i class="bi bi-clock-history text-primary me-2 mt-1"></i>
                                        <div>
                                            <strong>Best focus time</strong>: Schedule deep work for {{ tasks.length > 1 ? tasks[1].title : "Web App Development" }} in the morning.
                                        </div>
                                    </li>
                                    <li class="list-group-item d-flex align-items-start border-0 ps-0">
                                        <i class="bi bi-heart-pulse text-danger me-2 mt-1"></i>
                                        <div>
                                            <strong>Wellness note</strong>: Remember to schedule breaks between study sessions for optimal retention.
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Notifications and Reminders -->
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-primary-light text-dark">
                        <i class="bi bi-bell me-2"></i> Notifications & Reminders
                    </div>
                    <div class="card-body p-0">
                        <div class="list-group list-group-flush">
                            <div class="list-group-item d-flex align-items-center border-start-0 border-end-0">
                                <div class="flex-shrink-0">
                                    <div class="notification-icon bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                        <i class="bi bi-calendar-event"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Upcoming study session</h6>
                                        <small>Today, 14:00</small>
                                    </div>
                                    <p class="mb-1 small">{{ tasks[0]?.title || "Advanced Machine Learning" }} study session scheduled</p>
                                </div>
                                <div class="flex-shrink-0 ms-2">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="notif1" checked>
                                    </div>
                                </div>
                            </div>
                            <div class="list-group-item d-flex align-items-center border-start-0 border-end-0">
                                <div class="flex-shrink-0">
                                    <div class="notification-icon bg-warning text-dark rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                        <i class="bi bi-emoji-smile"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1 ms-3">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">Wellness reminder</h6>
                                        <small>Every hour</small>
                                    </div>
                                    <p class="mb-1 small">Take a short 5-minute break to stretch</p>
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
                            <span class="text-muted small">Notification preferences</span>
                            <button class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-gear me-1"></i> Configure
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            tasks: window.DataService.getTasks(),
            generating: false,
            planGenerated: false,
        };
    },
    methods: {
        // Retorna el projecte associat a una tasca donat el seu id
        getProject(id) {
            return window.DataService.getProjects().find(p => p.id === id);
        },
        // Simula la generació d'un pla AI per a les tasques de l'usuari
        generatePlan() {
            if (this.tasks.length === 0) return;
            this.generating = true;
            this.planGenerated = false;
            console.log("Simulant generació de pla AI amb les tasques:", this.tasks);
            setTimeout(() => {
                this.generating = false;
                this.planGenerated = true;
            }, 1500);
        },
        // Simula una acció sobre un bloc de l'horari (per exemple, editar-lo)
        simulateAction(action) {
            console.log("Acció simulada:", action);
            alert('Funció fora dels escenaris de ús');
        },
        // Dona format a una data per mostrar-la de manera llegible
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString + 'T00:00:00');
                return new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }).format(date);
            } catch (e) {
                return dateString;
            }
        },
        // Retorna la classe CSS per la prioritat d'una tasca
        getPriorityClass(priority) {
            switch (priority?.toLowerCase()) {
                case 'low': return 'bg-success text-light';
                case 'medium': return 'bg-warning text-dark';
                case 'high': return 'bg-danger text-dark';
                case 'urgent': return 'bg-danger-emphasis text-dark border-light';
                default: return 'bg-secondary text-light';
            }
        }
    }
};

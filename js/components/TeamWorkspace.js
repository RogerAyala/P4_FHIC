// Aquest component gestiona la vista detallada d'un espai de treball en equip.
// Permet als usuaris seleccionar un equip per veure'n els membres, els projectes associats
// i les tasques. Ofereix la possibilitat de canviar entre una vista Kanban i una vista de llista
// per a les tasques, aplicar filtres per assignat, prioritat i data límit, i veure els detalls de cada tasca.
// També inclou modal per crear noves tasques dins de l'equip seleccionat.
let TaskCard;
if (typeof window !== 'undefined') {
    TaskCard = window.TaskCard;
}

window.TeamWorkspace = {
    components: {
        'task-card': TaskCard // Registrem el component TaskCard localment
    },
    template: `
        <div class="team-workspace-view container-fluid">
            <!-- Capçalera de l'equip o llista d'equips -->
            <div class="mb-4 pb-3">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <h2 class="mb-1">
                            <span v-if="selectedWorkspaceId">{{ selectedWorkspace.name }}</span>
                            <span v-else>My Teams</span>
                        </h2>
                        <p class="text-muted">
                            <span v-if="selectedWorkspaceId">{{ selectedWorkspace.description }}</span>
                            <span v-else>Select a team to view its members and tasks</span>
                        </p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <button class="btn btn-primary" v-if="selectedWorkspaceId" @click="openNewTaskModal()">
                            <i class="bi bi-plus-lg me-1"></i> New Task
                        </button>
                    </div>
                </div>
            </div>

            <!-- Vista inicial: Selecció d'equip -->
            <div v-if="!selectedWorkspaceId" class="row g-4 mb-4">
                <!-- Iterem sobre cada espai de treball disponible per mostrar-lo com una targeta -->
                <div v-for="workspace in workspaces" :key="workspace.id" class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="mb-3">{{ workspace.name }}</h5>
                            <p class="text-muted small mb-4">{{ workspace.description }}</p>
                            <div class="mb-3">
                                <p class="mb-2 text-muted small">TEAM MEMBERS</p>
                                <div>
                                    <!-- Mostrem les avatars dels membres de l'equip -->
                                    <span v-for="userId in workspace.members" :key="userId" class="me-1">
                                        <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name"
                                             class="assignee-avatar" :title="getUser(userId)?.name" width="28" height="28">
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p class="mb-2 text-muted small">PROJECTS</p>
                                <div>
                                    <!-- Mostrem les etiquetes dels projectes associats a l'equip -->
                                    <span class="badge me-1 mb-1"
                                         v-for="projectId in workspace.projects"
                                         :key="projectId"
                                         :style="{ backgroundColor: 'rgba(255, 56, 92, 0.08)', color: 'var(--primary)' }">
                                        {{ getProject(projectId)?.title }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0">
                            <!-- Botó per seleccionar aquest equip i anar a la seva vista detallada -->
                            <button class="btn btn-sm btn-outline-secondary" @click="selectWorkspace(workspace.id)">
                                View Team
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Vista detallada de l'equip seleccionat -->
            <div v-if="selectedWorkspaceId">
                <!-- Controls principals: Tornar, canviar vista, importar -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <button class="btn btn-sm btn-outline-secondary" @click="goBack">
                            <i class="bi bi-arrow-left me-1"></i> Back
                        </button>
                    </div>
                    <div>
                        <button class="btn btn-outline-secondary btn-sm me-2" @click="toggleView">
                            <i :class="isKanbanView ? 'bi bi-list-ul' : 'bi bi-kanban'"></i>
                            {{ isKanbanView ? 'List View' : 'Kanban View' }}
                        </button>
                        <button class="btn btn-sm" style="background-color: var(--secondary); color: white;" @click="simulateImport">
                            <i class="bi bi-upload me-1"></i> Import Tasks
                        </button>
                    </div>
                </div>

                <!-- Informació detallada de l'equip: membres i estadístiques -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-lg-8">
                                <h5 class="card-title mb-3">Team Members</h5>
                                <div class="d-flex flex-wrap">
                                    <!-- Targetes dels membres de l'equip -->
                                    <div v-for="userId in selectedWorkspace.members" :key="userId"
                                         class="team-member-card me-3 mb-3 text-center">
                                        <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name"
                                             class="rounded-circle mb-2" width="52" height="52">
                                        <div class="mb-1">{{ getUser(userId)?.name }}</div>
                                        <small class="text-muted">{{ getUser(userId)?.role || 'Team Member' }}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <h5 class="card-title mb-3">Team Stats</h5>

                                <div class="d-flex justify-content-between text-muted small mb-1">
                                    <span>Task Status</span>
                                    <span>{{ currentTasks.length }} total tasks</span>
                                </div>

                                <!-- Barra de progrés de l'estat de les tasques -->
                                <div class="progress mb-3" style="height: 6px;">
                                    <div class="progress-bar bg-primary" role="progressbar"
                                         :style="{width: getTaskStatusPercentage('To Do') + '%'}"
                                         :aria-valuenow="getTaskStatusPercentage('To Do')"
                                         aria-valuemin="0" aria-valuemax="100" title="To Do"></div>
                                    <div class="progress-bar bg-warning" role="progressbar"
                                         :style="{width: getTaskStatusPercentage('In Progress') + '%'}"
                                         :aria-valuenow="getTaskStatusPercentage('In Progress')"
                                         aria-valuemin="0" aria-valuemax="100" title="In Progress"></div>
                                    <div class="progress-bar bg-success" role="progressbar"
                                         :style="{width: getTaskStatusPercentage('Done') + '%'}"
                                         :aria-valuenow="getTaskStatusPercentage('Done')"
                                         aria-valuemin="0" aria-valuemax="100" title="Done"></div>
                                </div>

                                <!-- Llegendes de la barra de progrés -->
                                <div class="d-flex gap-3 mb-3">
                                    <div class="d-flex align-items-center">
                                        <span class="d-inline-block me-1" style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--primary)"></span>
                                        <small>{{ getTaskStatusCount('To Do') }} To Do</small>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <span class="d-inline-block me-1" style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--warning)"></span>
                                        <small>{{ getTaskStatusCount('In Progress') }} In Progress</small>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <span class="d-inline-block me-1" style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--success)"></span>
                                        <small>{{ getTaskStatusCount('Done') }} Done</small>
                                    </div>
                                </div>

                                <!-- Llista de projectes de l'equip amb el seu progrés -->
                                <h6 class="text-muted small mt-4 mb-2">TEAM PROJECTS</h6>
                                <div v-for="projectId in selectedWorkspace.projects" :key="projectId"
                                    class="d-flex justify-content-between align-items-center mb-2 py-2 px-1 border-bottom">
                                    <div>{{ getProject(projectId)?.title }}</div>
                                    <span class="badge" :style="{
                                        backgroundColor: getProgressColor(getProject(projectId)?.progress),
                                        color: getProject(projectId)?.progress > 50 ? 'white' : '#333'
                                    }">
                                        {{ getProject(projectId)?.progress }}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Controls de filtratge per a les tasques -->
                <div class="card mb-4">
                    <div class="card-body pt-2 pb-2">
                        <div class="row align-items-center">
                            <div class="col-md-3 py-2">
                                <!-- Filtre per assignat -->
                                <select class="form-select form-select-sm" v-model="filterAssignee">
                                    <option value="">Filter by Assignee</option>
                                    <option v-for="user in teamMembers" :key="user.id" :value="user.id">{{ user.name }}</option>
                                </select>
                            </div>
                            <div class="col-md-3 py-2">
                                <!-- Filtre per prioritat -->
                                <select class="form-select form-select-sm" v-model="filterPriority">
                                    <option value="">Filter by Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div class="col-md-3 py-2">
                                <!-- Filtre per data límit -->
                                <input type="date" class="form-control form-control-sm" v-model="filterDeadline" title="Filter by Deadline on or before">
                            </div>
                            <div class="col-md-3 py-2 text-end">
                                <!-- Botó per esborrar tots els filtres -->
                                <button class="btn btn-outline-secondary btn-sm" @click="clearFilters" v-if="isFiltered">Clear Filters</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vista Kanban -->
                <div v-if="isKanbanView" class="row g-4">
                    <!-- Columnes per cada estat de tasca (To Do, In Progress, Done) -->
                    <div v-for="status in statuses" :key="status" class="col-md-4">
                        <div class="card h-100 kanban-card">
                            <!-- Capçalera de la columna amb el nom de l'estat i el nombre de tasques -->
                            <div class="card-header d-flex align-items-center justify-content-between" :class="getStatusHeaderClass(status)">
                                <h5 class="m-0">{{ status }}</h5>
                                <span class="badge bg-white text-dark">{{ filteredTasks(status).length }}</span>
                            </div>
                            <!-- Cos de la columna on es mostren les tasques. Permet arrossegar i deixar anar. -->
                            <div class="card-body kanban-column"
                                @dragover.prevent
                                @drop="handleDrop(status, $event)">
                                <p class="text-muted small text-center mb-2" v-if="filteredTasks(status).length === 0">
                                    <i class="bi bi-arrow-down-square me-1"></i>
                                    Drop tasks here
                                </p>
                                <!-- Component TaskCard per cada tasca filtrada en aquest estat -->
                                <task-card
                                    v-for="task in filteredTasks(status)"
                                    :key="task.id"
                                    :task="task"
                                    @click="openTaskDetails(task)"
                                    draggable="true"
                                    @dragstart="handleDragStart(task, $event)">
                                </task-card>
                            </div>
                            <!-- Botó per afegir una nova tasca directament a aquesta columna (estat) -->
                            <div class="card-footer bg-transparent text-center">
                                <button class="btn btn-sm btn-outline-primary" @click="openNewTaskModal(status)">
                                    <i class="bi bi-plus-lg"></i> Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Vista de Llista -->
                <div v-else class="list-view">
                    <div class="card">
                        <div class="card-body p-0">
                            <!-- Taula per mostrar les tasques en format de llista -->
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Assignee(s)</th>
                                        <th>Project</th>
                                        <th>Deadline</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Fila per cada tasca filtrada -->
                                    <tr v-for="task in currentFilteredTasks" :key="task.id">
                                        <td>{{ task.title }}</td>
                                        <td>
                                            <!-- Avatars dels assignats -->
                                            <span v-for="userId in task.assignees" :key="userId" class="me-1">
                                                <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name" class="assignee-avatar" :title="getUser(userId)?.name">
                                            </span>
                                        </td>
                                        <td>{{ getProject(task.projectId)?.title || 'N/A' }}</td>
                                        <td>{{ formatDate(task.deadline) }}</td>
                                        <td><span :class="['badge', getPriorityClass(task.priority)]">{{ task.priority }}</span></td>
                                        <td>{{ task.status }}</td>
                                        <td>
                                            <!-- Botó per obrir els detalls de la tasca -->
                                            <button class="btn btn-sm btn-outline-secondary" @click="openTaskDetails(task)">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <!-- Missatge si no hi ha tasques que coincideixin amb els filtres -->
                                    <tr v-if="currentFilteredTasks.length === 0">
                                        <td colspan="7" class="text-center text-muted p-4">No tasks match the current filters.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <teleport to="body">
            <!-- Modal per crear una nova tasca -->
            <div class="modal fade" id="newTaskModal" tabindex="-1" aria-labelledby="newTaskModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="newTaskModalLabel">Create New Team Task</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Formulari de creació de tasca -->
                            <form @submit.prevent="createTask">
                                <div class="mb-3">
                                    <label for="taskTitle" class="form-label">Title <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="taskTitle" v-model="newTask.title" required>
                                </div>
                                <div class="mb-3">
                                    <label for="taskDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="taskDescription" rows="3" v-model="newTask.description"></textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="taskProject" class="form-label">Project</label>
                                        <!-- Selector de projecte (només els de l'equip) -->
                                        <select class="form-select" id="taskProject" v-model="newTask.projectId">
                                            <option value="">No Project</option>
                                            <option v-for="projectId in selectedWorkspace?.projects" :key="projectId" :value="projectId">
                                                {{ getProject(projectId)?.title }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="taskAssignees" class="form-label">Assignee(s)</label>
                                        <!-- Selector múltiple d'assignats (només membres de l'equip) -->
                                        <select id="taskAssignees" class="form-select" multiple v-model="newTask.assignees">
                                            <option v-for="userId in selectedWorkspace?.members" :key="userId" :value="userId">
                                                {{ getUser(userId)?.name }} ({{ getUser(userId)?.role || 'Team Member' }})
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="taskDeadline" class="form-label">Deadline</label>
                                        <input type="date" class="form-control" id="taskDeadline" v-model="newTask.deadline">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="taskPriority" class="form-label">Priority</label>
                                        <!-- Selector de prioritat -->
                                        <select class="form-select" id="taskPriority" v-model="newTask.priority">
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>Urgent</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 mb-3">
                                        <label for="taskStatus" class="form-label">Status</label>
                                        <!-- Selector d'estat -->
                                        <select class="form-select" id="taskStatus" v-model="newTask.status">
                                            <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="submit" class="btn btn-primary">Create Task</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal per veure els detalls d'una tasca -->
            <div class="modal fade" id="taskDetailsModal" tabindex="-1" aria-labelledby="taskDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="taskDetailsModalLabel">{{ selectedTask?.title }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Mostra els detalls de la tasca seleccionada -->
                            <div v-if="selectedTask">
                                <div class="mb-4">
                                    <span :class="['badge me-2', getPriorityClass(selectedTask.priority)]">{{ selectedTask.priority }}</span>
                                    <span class="badge" :style="{ backgroundColor: 'rgba(255, 56, 92, 0.1)', color: 'var(--primary)' }">{{ selectedTask.status }}</span>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-muted small">TEAM</h6>
                                    <p>{{ getWorkspace(selectedTask.workspaceId)?.name || 'N/A' }}</p>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-muted small">PROJECT</h6>
                                    <p>{{ getProject(selectedTask.projectId)?.title || 'No specific project' }}</p>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-muted small">DESCRIPTION</h6>
                                    <p>{{ selectedTask.description || 'No description provided' }}</p>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-muted small">ASSIGNEES</h6>
                                    <!-- Mostra els assignats amb la seva avatar i nom -->
                                    <div class="d-flex align-items-center mb-2" v-for="userId in selectedTask.assignees" :key="userId">
                                        <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name" class="assignee-avatar me-2">
                                        <span>{{ getUser(userId)?.name }} ({{ getUser(userId)?.role || 'Team Member' }})</span>
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <h6 class="text-muted small">DEADLINE</h6>
                                    <p>{{ formatDate(selectedTask.deadline) || 'No deadline set' }}</p>
                                </div>

                                <hr class="my-4">
                                <h6 class="text-muted small">SUBTASKS</h6>
                                <!-- Secció per sub-tasques (fora d'abast per ara) -->
                                <p class="text-muted">Funció fora dels escensaris de ús</p>

                                <hr class="my-4">
                                <h6 class="text-muted small">COMMENTS</h6>
                                <!-- Secció per comentaris (fora d'abast per ara) -->
                                <p class="text-muted">Funció fora dels escensaris de ús</p>
                                <div class="mb-3">
                                    <textarea class="form-control" placeholder="Add a comment..." rows="2"></textarea>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary">Add Comment</button>

                                <hr class="my-4">
                                <h6 class="text-muted small">ACTIVITY</h6>
                                <!-- Secció per l'activitat (fora d'abast per ara) -->
                                <p class="text-muted">Funció fora dels escensaris de ús</p>
                            </div>
                            <div v-else>
                                <!-- Missatge de càrrega si la tasca encara no està seleccionada -->
                                <div class="text-center p-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p class="mt-2">Loading task details...</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </teleport>
    `,
    data() {
        return {
            isKanbanView: true, // Controla si es mostra la vista Kanban o la de llista
            selectedWorkspaceId: null, // ID de l'equip seleccionat actualment
            statuses: ['To Do', 'In Progress', 'Done'], // Estats possibles per a les tasques

            // Dades obtingudes del DataService
            users: window.DataService.getUsers(),
            projects: window.DataService.getProjects(),
            workspaces: window.DataService.getWorkspaces(),
            tasks: window.DataService.getTasks(),

            // Dades per al formulari de creació de nova tasca
            newTask: {
                title: '', description: '', assignees: [], deadline: '', priority: 'Medium', status: 'To Do', projectId: null, workspaceId: null
            },
            selectedTask: null, // Tasca seleccionada per veure els detalls al modal
            taskDetailsModalInstance: null, // Instància del modal de detalls de tasca
            newTaskModalInstance: null, // Instància del modal de nova tasca
            draggedTask: null, // Tasca que s'està arrossegant al Kanban

            // Filtres aplicats a les tasques
            filterAssignee: '',
            filterPriority: '',
            filterDeadline: ''
        };
    },
    computed: {
        // Retorna l'objecte workspace seleccionat actualment
        selectedWorkspace() {
            return this.workspaces.find(w => w.id === this.selectedWorkspaceId);
        },
        // Retorna la llista de membres de l'equip seleccionat
        teamMembers() {
            if (this.selectedWorkspaceId) {
                const workspace = this.getWorkspace(this.selectedWorkspaceId);
                return workspace ? this.users.filter(user => workspace.members.includes(user.id)) : [];
            }
            return [];
        },
        // Retorna totes les tasques que pertanyen a l'equip seleccionat
        currentTasks() {
            if (this.selectedWorkspaceId) {
                return this.tasks.filter(task => task.workspaceId === this.selectedWorkspaceId);
            }
            return [];
        },
        // Retorna les tasques de l'equip seleccionat, aplicant els filtres actius
        currentFilteredTasks() {
            return this.currentTasks.filter(task => {
                const assigneeMatch = !this.filterAssignee || task.assignees.includes(parseInt(this.filterAssignee));
                const priorityMatch = !this.filterPriority || task.priority === this.filterPriority;
                const deadlineMatch = !this.filterDeadline || (task.deadline && task.deadline <= this.filterDeadline);
                return assigneeMatch && priorityMatch && deadlineMatch;
            });
        },
        // Indica si s'està aplicant algun filtre
        isFiltered() {
            return this.filterAssignee || this.filterPriority || this.filterDeadline;
        }
    },
    methods: {
        // Selecciona un espai de treball per mostrar la seva vista detallada
        selectWorkspace(workspaceId) {
            this.selectedWorkspaceId = workspaceId;
            if (workspaceId) {
                this.newTask.workspaceId = workspaceId;
            }
        },
        // Torna a la vista inicial de selecció d'equips
        goBack() {
            this.selectedWorkspaceId = null;
        },
        // Busca i retorna un objecte projecte per la seva ID
        getProject(id) {
            return this.projects.find(p => p.id === id);
        },
        // Busca i retorna un objecte workspace per la seva ID
        getWorkspace(id) {
            return this.workspaces.find(w => w.id === id);
        },
        // Determina el color de la barra de progrés d'un projecte
        getProgressColor(progress) {
            if (progress < 25) return 'var(--warning)';
            if (progress < 75) return 'var(--primary)';
            return 'var(--success)';
        },
        // Determina la classe del badge de progrés d'un projecte (no utilitzat al template actual)
        getProgressBadgeClass(progress) {
            if (!progress) return 'bg-secondary';
            if (progress < 25) return 'bg-danger';
            if (progress < 50) return 'bg-warning text-dark';
            if (progress < 75) return 'bg-primary';
            return 'bg-success';
        },
        // Canvia entre la vista Kanban i la vista de llista
        toggleView() {
            this.isKanbanView = !this.isKanbanView;
        },
        // Retorna les tasques filtrades per un estat específic (usat a la vista Kanban)
        filteredTasks(status) {
            return this.currentFilteredTasks.filter(task => task.status === status);
        },
        // Busca i retorna un objecte usuari per la seva ID
        getUser(userId) {
            return this.users.find(user => user.id === userId);
        },
        // Compta el nombre de tasques en un estat específic
        getTaskStatusCount(status) {
            return this.currentTasks.filter(task => task.status === status).length;
        },
        // Calcula el percentatge de tasques en un estat específic
        getTaskStatusPercentage(status) {
            const totalTasks = this.currentTasks.length;
            if (totalTasks === 0) return 0;
            return Math.round((this.getTaskStatusCount(status) / totalTasks) * 100);
        },
        // Determina la classe CSS per al badge de prioritat
        getPriorityClass(priority) {
            switch (priority?.toLowerCase()) {
                case 'low': return 'bg-success text-light';
                case 'medium': return 'bg-warning text-dark';
                case 'high': return 'bg-danger text-light';
                case 'urgent': return 'bg-danger-emphasis text-light border border-light';
                default: return 'bg-secondary text-light';
            }
        },
        // Determina la classe CSS per a la capçalera de la columna de l'estat al Kanban
        getStatusHeaderClass(status) {
            switch (status?.toLowerCase()) {
                case 'to do': return 'bg-primary';
                case 'in progress': return 'bg-warning';
                case 'done': return 'bg-success';
                default: return 'bg-secondary';
            }
        },
        // Crea una nova tasca a partir de les dades del formulari
        createTask() {
            if (!this.newTask.title || !this.selectedWorkspaceId) return;
            this.newTask.workspaceId = this.selectedWorkspaceId;

            // Utilitza el DataService per persistir la nova tasca
            const newTaskToAdd = window.DataService.createTask({
                ...this.newTask,
                assignees: this.newTask.assignees.map(id => parseInt(id))
            });
            
            this.tasks = [...window.DataService.getTasks()];

            // Reinicia el formulari mantenint l'equip seleccionat
            const wsId = this.selectedWorkspaceId;
            this.newTask = { title: '', description: '', assignees: [], deadline: '', priority: 'Medium', status: 'To Do', projectId: null, workspaceId: wsId };
            this.newTaskModalInstance.hide(); // Tanca el modal
            console.log("Team task created:", newTaskToAdd);
        },
        // Obre el modal de detalls per a una tasca específica
        openTaskDetails(task) {
            // Oculta la superposició mòbil si està activa
            const overlay = document.querySelector('.mobile-overlay');
            if (overlay && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            this.selectedTask = task;
            this.taskDetailsModalInstance.show();
        },
        // Obre el modal de creació de tasca, opcionalment pre-seleccionant un estat
        openNewTaskModal(status) {
             // Oculta la superposició mòbil si està activa
            const overlay = document.querySelector('.mobile-overlay');
            if (overlay && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (status) {
                this.newTask.status = status;
            }

            if (this.selectedWorkspaceId) {
                this.newTask.workspaceId = this.selectedWorkspaceId;
            }

            this.newTaskModalInstance.show();
        },
        // Simula la funcionalitat d'importació de tasques
        simulateImport() {
            console.log("Simulating task import...");
            alert("Funció fora dels escensaris de ús");
        },
        // Esborra tots els filtres actius
        clearFilters() {
            this.filterAssignee = '';
            this.filterPriority = '';
            this.filterDeadline = '';
        },
        // Formateja una data a un format curt (Mes Dia)
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString + 'T00:00:00');
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } catch (e) {
                return dateString;
            }
        },
        // Gestiona l'inici de l'arrossegament d'una tasca al Kanban
        handleDragStart(task, event) {
            console.log('Dragging task:', task.id);
            this.draggedTask = task;
            event.dataTransfer.effectAllowed = 'move';
        },
        // Gestiona l'acció de deixar anar una tasca a una columna del Kanban
        handleDrop(targetStatus, event) {
            event.preventDefault();
            if (!this.draggedTask) return;
            const idx = this.tasks.findIndex(t => t.id === this.draggedTask.id);
            // Si la tasca existeix i l'estat de destinació és diferent, l'actualitza
            if (idx !== -1 && this.tasks[idx].status !== targetStatus) {
                this.tasks[idx].status = targetStatus;
                window.DataService.updateTask(this.tasks[idx]); // Persisteix el canvi
            }
            this.draggedTask = null; // Reinicia la tasca arrossegada
        }
    },
    mounted() {
        // Inicialitza les instàncies dels modals de Bootstrap quan el component es munta
        const taskDetailsModalEl = document.getElementById('taskDetailsModal');
        if (taskDetailsModalEl) {
            // Configuració explícita de les opcions del modal
            this.taskDetailsModalInstance = new bootstrap.Modal(taskDetailsModalEl, {
                backdrop: true, // Per defecte, però explícit
                keyboard: true  // Per defecte, però explícit
            });
        }
        const newTaskModalEl = document.getElementById('newTaskModal');
        if (newTaskModalEl) {
            // Configuració explícita de les opcions del modal
            this.newTaskModalInstance = new bootstrap.Modal(newTaskModalEl, {
                backdrop: true, // Per defecte, però explícit
                keyboard: true  // Per defecte, però explícit
            });
        }
        console.log('Team Workspace component mounted.');
    },
    beforeUnmount() {
        // Neteja les instàncies dels modals abans que el component es desmunta
        this.taskDetailsModalInstance?.dispose();
        this.newTaskModalInstance?.dispose();
    }
};
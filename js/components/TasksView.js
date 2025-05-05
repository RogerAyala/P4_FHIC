window.TasksView = {
    template: `
        <div class="tasks-view animate__animated animate__fadeIn">
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between">
                    <h5 class="m-0">My Tasks</h5>
                    <!-- Botó per obrir el modal d'afegir tasca -->
                    <button class="btn btn-sm btn-primary" @click="openAddTaskModal">
                        <i class="bi bi-plus"></i> Add Task
                    </button>
                </div>
                <div class="card-body">
                    <!-- Controls de filtre i cerca per a la llista de tasques -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <!-- Filtre per prioritat -->
                            <select class="form-select form-select-sm" v-model="filters.priority">
                                <option value="">Filter by Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                             <!-- Filtre per estat -->
                            <select class="form-select form-select-sm" v-model="filters.status">
                                <option value="">Filter by Status</option>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                             <!-- Filtre per projecte -->
                            <select class="form-select form-select-sm" v-model="filters.project">
                                <option value="">Filter by Project</option>
                                <option v-for="project in projects" :key="project.id" :value="project.id">
                                    {{ project.title }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-3">
                             <!-- Camp de cerca per títol o descripció -->
                            <div class="input-group input-group-sm">
                                <input type="text" class="form-control" placeholder="Search tasks..." v-model="searchQuery">
                                <button class="btn btn-outline-secondary" type="button" @click="searchQuery = ''">
                                    <i class="bi" :class="searchQuery ? 'bi-x' : 'bi-search'"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Taula per mostrar les tasques filtrades i ordenades -->
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <!-- Checkbox per seleccionar totes les tasques -->
                                    <th scope="col" style="width: 40px;">
                                        <input type="checkbox" class="form-check-input" 
                                               v-model="selectAllTasks" 
                                               @change="toggleSelectAll">
                                    </th>
                                    <!-- Capçaleres clicables per ordenar -->
                                    <th scope="col" @click="sortBy('title')" style="cursor: pointer;">
                                        Task 
                                        <i v-if="sortCriteria === 'title'" :class="sortIcon"></i>
                                    </th>
                                    <th scope="col" @click="sortBy('dueDate')" style="cursor: pointer;">
                                        Due Date
                                        <i v-if="sortCriteria === 'dueDate'" :class="sortIcon"></i>
                                    </th>
                                    <th scope="col" @click="sortBy('project')" style="cursor: pointer;">
                                        Project
                                        <i v-if="sortCriteria === 'project'" :class="sortIcon"></i>
                                    </th>
                                    <th scope="col" @click="sortBy('priority')" style="cursor: pointer;">
                                        Priority
                                        <i v-if="sortCriteria === 'priority'" :class="sortIcon"></i>
                                    </th>
                                    <th scope="col" @click="sortBy('status')" style="cursor: pointer;">
                                        Status
                                        <i v-if="sortCriteria === 'status'" :class="sortIcon"></i>
                                    </th>
                                     <!-- Columna per accions individuals de cada tasca -->
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Iteració sobre les tasques filtrades i ordenades -->
                                <tr v-for="task in filteredAndSortedTasks" :key="task.id" 
                                    :class="{'table-light': task.status === 'Done'}">
                                     <!-- Checkbox individual de tasca -->
                                    <td>
                                        <input type="checkbox" class="form-check-input" v-model="task.selected">
                                    </td>
                                     <!-- Títol de la tasca -->
                                    <td>
                                        <span :class="{'text-decoration-line-through': task.status === 'Done'}">
                                            {{ task.title }}
                                        </span>
                                    </td>
                                    <!-- Data de venciment formatada -->
                                    <td>{{ formatDate(task.dueDate) }}</td>
                                    <!-- Títol del projecte associat -->
                                    <td>{{ getProjectTitle(task.projectId) }}</td>
                                     <!-- Badge de prioritat amb classe dinàmica -->
                                    <td><span class="badge" :class="getPriorityBadgeClass(task.priority)">{{ task.priority }}</span></td>
                                     <!-- Badge d'estat amb classe dinàmica -->
                                    <td><span class="badge" :class="getStatusBadgeClass(task.status)">{{ task.status }}</span></td>
                                    <!-- Botons d'acció per a cada tasca (editar, menú desplegable) -->
                                    <td class="text-end">
                                        <div class="btn-group btn-group-sm">
                                            <button class="btn btn-outline-secondary" @click="editTask(task)">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-outline-secondary dropdown-toggle" 
                                                    data-bs-toggle="dropdown">
                                                <i class="bi bi-three-dots-vertical"></i>
                                            </button>
                                             <!-- Menú desplegable d'accions addicionals -->
                                            <ul class="dropdown-menu dropdown-menu-end">
                                                <li><a class="dropdown-item" href="#" @click.prevent="markTaskAsDone(task)">
                                                    <i class="bi bi-check-circle me-2"></i> Mark as Done
                                                </a></li>
                                                <li><a class="dropdown-item" href="#" @click.prevent="duplicateTask(task)">
                                                    <i class="bi bi-copy me-2"></i> Duplicate
                                                </a></li>
                                                <li><hr class="dropdown-divider"></li>
                                                <li><a class="dropdown-item text-danger" href="#" @click.prevent="deleteTask(task)">
                                                    <i class="bi bi-trash me-2"></i> Delete
                                                </a></li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                                <!-- Missatge si no hi ha tasques que coincideixin amb els filtres -->
                                <tr v-if="filteredAndSortedTasks.length === 0">
                                    <td colspan="7" class="text-center py-4 text-muted">
                                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                                        <p class="mb-0">No tasks found. Add a new task to get started.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- Peu de la targeta amb informació de selecció i compte de tasques -->
                <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                    <div>
                        <!-- Mostra quantes tasques estan seleccionades i botons d'acció massiva -->
                        <span v-if="selectedTasksCount > 0" class="me-3">
                            {{ selectedTasksCount }} task{{ selectedTasksCount !== 1 ? 's' : '' }} selected
                        </span>
                        <div class="btn-group btn-group-sm" v-if="selectedTasksCount > 0">
                            <button class="btn btn-outline-secondary" @click="bulkAction('done')">
                                <i class="bi bi-check-circle me-1"></i> Mark as Done
                            </button>
                            <button class="btn btn-outline-secondary" @click="bulkAction('delete')">
                                <i class="bi bi-trash me-1"></i> Delete
                            </button>
                        </div>
                    </div>
                    <div>
                        <!-- Mostra el compte de tasques actual i un botó per esborrar filtres -->
                        <span class="text-muted me-3">
                            {{ filteredAndSortedTasks.length }} of {{ tasks.length }} tasks
                        </span>
                        <button class="btn btn-sm btn-outline-secondary" @click="resetFilters" v-if="isFiltered">
                            <i class="bi bi-x-lg me-1"></i> Clear Filters
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Secció que mostra tasques properes o d'avui, depenent de la vista -->
            <div class="card mb-4" v-if="currentSubView === 'upcoming' || currentSubView === 'today'">
                <div class="card-header">
                    <h5 class="m-0">{{ currentSubView === 'today' ? "Today's Tasks" : 'Upcoming Tasks' }}</h5>
                </div>
                <div class="card-body">
                    <!-- Llista de tasques agrupades per data -->
                    <div class="upcoming-tasks">
                        <!-- Agrupa les tasques per data de venciment -->
                        <div v-for="(group, date) in groupedUpcomingTasks" :key="date" class="mb-4">
                            <!-- Capçalera per a cada grup de data -->
                            <h6 class="mb-3 text-muted">{{ formatGroupDate(date) }}</h6>
                            <div class="list-group">
                                <!-- Llista d'elements per a cada tasca dins del grup de data -->
                                <div v-for="task in group" :key="task.id" 
                                     class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <div>
                                        <!-- Checkbox per marcar la tasca com a feta i el seu títol -->
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" 
                                                  :checked="task.status === 'Done'"
                                                  @change="toggleTaskStatus(task)">
                                            <label class="form-check-label" :class="{'text-decoration-line-through': task.status === 'Done'}">
                                                {{ task.title }}
                                            </label>
                                        </div>
                                         <!-- Títol del projecte associat -->
                                        <small class="text-muted">{{ getProjectTitle(task.projectId) }}</small>
                                    </div>
                                    <div>
                                        <!-- Badge de prioritat i botó d'editar -->
                                        <span class="badge" :class="getPriorityBadgeClass(task.priority)">{{ task.priority }}</span>
                                        <button class="btn btn-sm btn-outline-secondary ms-2" @click="editTask(task)">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                         <!-- Missatge si no hi ha tasques properes o d'avui -->
                        <div v-if="Object.keys(groupedUpcomingTasks).length === 0" class="text-center py-4 text-muted">
                            <i class="bi bi-calendar2-check fs-2 d-block mb-2"></i>
                            <p class="mb-0">No upcoming tasks. Enjoy your free time!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: {
        // Defineix la subvista actual ('all', 'today', 'upcoming')
        currentSubView: {
            type: String,
            default: 'all'
        }
    },
    data() {
        // Inicialitza l'estat del component amb les tasques i projectes
        return {
            tasks: window.DataService.getTasks(),
            projects: window.DataService.getProjects(),
            // Objecte per emmagatzemar els filtres de l'usuari
            filters: {
                priority: '',
                status: '',
                project: ''
            },
            // Cadena de cerca per filtrar per títol/descripció
            searchQuery: '',
            // Criteri d'ordenació i direcció
            sortCriteria: 'dueDate',
            sortDirection: 'asc',
            // Estat del checkbox "seleccionar tot"
            selectAllTasks: false
        };
    },
    computed: {
        // Retorna les tasques filtrades basant-se en la subvista actual i els filtres de l'usuari
        filteredTasks() {
            return this.tasks.filter(task => {
                // Aplica el filtre de la subvista (avui o properes)
                if (this.currentSubView === 'today') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const taskDate = new Date(task.dueDate + 'T00:00:00');
                    if (taskDate.getTime() !== today.getTime()) {
                        return false;
                    }
                } else if (this.currentSubView === 'upcoming') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const taskDate = new Date(task.dueDate + 'T00:00:00');
                    if (taskDate < today) {
                        return false;
                    }
                }
                
                // Aplica els filtres de l'usuari (prioritat, estat, projecte, cerca)
                const priorityMatch = this.filters.priority ? task.priority === this.filters.priority : true;
                const statusMatch = this.filters.status ? task.status === this.filters.status : true;
                const projectMatch = this.filters.project ? task.projectId === parseInt(this.filters.project) : true;
                const searchMatch = this.searchQuery ? 
                    task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                    (task.description && task.description.toLowerCase().includes(this.searchQuery.toLowerCase())) : 
                    true;
                
                return priorityMatch && statusMatch && projectMatch && searchMatch;
            });
        },
        // Retorna les tasques filtrades i després ordenades segons el criteri i direcció actuals
        filteredAndSortedTasks() {
            return [...this.filteredTasks].sort((a, b) => {
                let aValue = a[this.sortCriteria];
                let bValue = b[this.sortCriteria];
                
                // Gestió especial per ordenar per nom de projecte
                if (this.sortCriteria === 'project') {
                    aValue = this.getProjectTitle(a.projectId);
                    bValue = this.getProjectTitle(b.projectId);
                }
                
                // Gestió especial per ordenar per data
                if (this.sortCriteria === 'dueDate') {
                    aValue = new Date(a.dueDate);
                    bValue = new Date(b.dueDate);
                    return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }
                
                // Ordenació per cadenes de text
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return this.sortDirection === 'asc' ? 
                        aValue.localeCompare(bValue) : 
                        bValue.localeCompare(aValue);
                }
                
                // Ordenació per altres tipus de dades
                return this.sortDirection === 'asc' ? 
                    (aValue > bValue ? 1 : -1) : 
                    (aValue < bValue ? 1 : -1);
            });
        },
        // Conta quantes tasques tenen la propietat 'selected' a true
        selectedTasksCount() {
            return this.tasks.filter(task => task.selected).length;
        },
        // Indica si hi ha algun filtre o cerca actiu
        isFiltered() {
            return this.filters.priority || this.filters.status || this.filters.project || this.searchQuery;
        },
        // Determina la icona de Bootstrap per mostrar la direcció de l'ordenació
        sortIcon() {
            return this.sortDirection === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill';
        },
        // Retorna les tasques amb data de venciment avui o en el futur
        upcomingTasks() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return this.tasks.filter(task => {
                const taskDate = new Date(task.dueDate + 'T00:00:00');
                return taskDate >= today;
            });
        },
        // Agrupa les tasques properes o d'avui per data de venciment
        groupedUpcomingTasks() {
            const groupedTasks = {};
            
            // Filtra les tasques segons la subvista (avui o properes)
            const tasksToGroup = this.currentSubView === 'today' ? 
                this.tasks.filter(task => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const taskDate = new Date(task.dueDate + 'T00:00:00');
                    return taskDate.getTime() === today.getTime();
                }) : this.upcomingTasks;
            
            // Agrupa les tasques per data
            tasksToGroup.forEach(task => {
                if (!groupedTasks[task.dueDate]) {
                    groupedTasks[task.dueDate] = [];
                }
                groupedTasks[task.dueDate].push(task);
            });
            
            // Ordena els grups per data
            return Object.fromEntries(
                Object.entries(groupedTasks).sort(([dateA], [dateB]) => {
                    return new Date(dateA) - new Date(dateB);
                })
            );
        }
    },
    methods: {
        // Formata una cadena de data per mostrar-la a la llista
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString + 'T00:00:00');
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } catch (e) {
                return dateString;
            }
        },
        // Formata una cadena de data per mostrar-la com a capçalera de grup (Avui, Demà, o data)
        formatGroupDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString + 'T00:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                if (date.getTime() === today.getTime()) {
                    return 'Today';
                } else if (date.getTime() === tomorrow.getTime()) {
                    return 'Tomorrow';
                } else {
                    return date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short', 
                        day: 'numeric'
                    });
                }
            } catch (e) {
                return dateString;
            }
        },
        // Busca el títol d'un projecte donat el seu ID
        getProjectTitle(projectId) {
            const project = this.projects.find(p => p.id === projectId);
            return project ? project.title : 'No Project';
        },
        // Retorna la classe CSS de Bootstrap per al badge de prioritat
        getPriorityBadgeClass(priority) {
            switch (priority) {
                case 'High': return 'bg-danger';
                case 'Medium': return 'bg-warning text-dark';
                case 'Low': return 'bg-success';
                default: return 'bg-secondary';
            }
        },
        // Retorna la classe CSS de Bootstrap per al badge d'estat
        getStatusBadgeClass(status) {
            switch (status) {
                case 'To Do': return 'bg-info';
                case 'In Progress': return 'bg-warning text-dark';
                case 'Done': return 'bg-secondary';
                default: return 'bg-secondary';
            }
        },
        // Canvia el criteri d'ordenació i la direcció
        sortBy(criteria) {
            if (this.sortCriteria === criteria) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortCriteria = criteria;
                this.sortDirection = 'asc';
            }
            console.log(`Sorting by ${criteria} in ${this.sortDirection} order`);
        },
        // Selecciona o desselecciona totes les tasques
        toggleSelectAll() {
            this.tasks.forEach(task => {
                task.selected = this.selectAllTasks;
            });
        },
        // Restableix tots els filtres i la cerca
        resetFilters() {
            this.filters = {
                priority: '',
                status: '',
                project: ''
            };
            this.searchQuery = '';
        },
        // Funció dummy per obrir el modal d'afegir tasca
        openAddTaskModal() {
            console.log('Opening add task modal');
            alert('Funció fora dels escensaris de ús');
        },
        // Funció dummy per editar una tasca
        editTask(task) {
            console.log('Editing task:', task.id);
            alert('Funció fora dels escensaris de ús');
        },
        // Marca una tasca individual com a feta
        markTaskAsDone(task) {
            task.status = 'Done';
            console.log('Marked task as done:', task.id);
        },
        // Duplica una tasca existent
        duplicateTask(task) {
            const newTask = { 
                ...task, 
                id: this.tasks.length + 1, // ID simple basat en la longitud actual (caldria millorar en producció)
                title: `${task.title} (Copy)`,
                selected: false // La còpia no ha d'estar seleccionada per defecte
            };
            this.tasks.push(newTask);
            console.log('Duplicated task:', task.id, 'New task ID:', newTask.id);
        },
        // Elimina una tasca individual després demanar confirmació
        deleteTask(task) {
            if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
                const index = this.tasks.findIndex(t => t.id === task.id);
                if (index !== -1) {
                    this.tasks.splice(index, 1);
                    console.log('Deleted task:', task.id);
                }
            }
        },
        // Realitza una acció massiva (marcar com a feta o eliminar) sobre les tasques seleccionades
        bulkAction(action) {
            const selectedTasks = this.tasks.filter(task => task.selected);
            if (selectedTasks.length === 0) return;
            
            if (action === 'done') {
                if (confirm(`Mark ${selectedTasks.length} task(s) as done?`)) {
                    selectedTasks.forEach(task => {
                        task.status = 'Done';
                    });
                    this.selectAllTasks = false; // Deselecciona el "seleccionar tot"
                    console.log(`Marked ${selectedTasks.length} task(s) as done`);
                }
            } else if (action === 'delete') {
                if (confirm(`Delete ${selectedTasks.length} task(s)? This cannot be undone.`)) {
                    selectedTasks.forEach(task => {
                        const index = this.tasks.findIndex(t => t.id === task.id);
                        if (index !== -1) {
                            this.tasks.splice(index, 1);
                        }
                    });
                    this.selectAllTasks = false; // Deselecciona el "seleccionar tot"
                    console.log(`Deleted ${selectedTasks.length} task(s)`);
                }
            }
        },
        // Canvia l'estat d'una tasca entre 'Done' i 'To Do' (usat a la vista properes/avui)
        toggleTaskStatus(task) {
            task.status = task.status === 'Done' ? 'To Do' : 'Done';
            console.log('Toggled task status:', task.id, 'New status:', task.status);
        }
    },
    mounted() {
        // Funció que s'executa quan el component es munta
        console.log('Tasks view component mounted with subview:', this.currentSubView);
    },
    watch: {
        // Observa canvis a la propietat currentSubView
        currentSubView(newVal) {
            console.log('Tasks subview changed to:', newVal);
        }
    }
};
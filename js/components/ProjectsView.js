// js/components/ProjectsView.js

// Make sure TaskCard is available by defining it here if it's not imported
let TaskCardProject;
if (typeof window !== 'undefined') {
    TaskCardProject = window.TaskCard;
}

window.ProjectsView = {
    components: {
        'task-card': TaskCardProject // Register TaskCard locally
    },
    template: `
        <div class="projects-view container-fluid">
            <!-- Project Navigation -->
            <div class="mb-4 pb-3">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <h2 class="mb-1">
                            <span v-if="selectedProjectId">{{ selectedProject.title }}</span>
                            <span v-else>Projects</span>
                        </h2>
                        <p class="text-muted">
                            <span v-if="selectedProjectId">{{ selectedProject.goal }}</span>
                            <span v-else>Manage your projects and objectives</span>
                        </p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newTaskModal">
                            <i class="bi bi-plus-lg me-1"></i> New Task
                        </button>
                    </div>
                </div>
            </div>

            <!-- Project List (Initial View) -->
            <div v-if="!selectedProjectId" class="row g-4 mb-4">
                <div v-for="project in projects" :key="project.id" class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="mb-2 d-flex align-items-center">
                                {{ project.title }}
                                <span class="badge rounded-pill ms-2" :style="{ backgroundColor: 'rgba(255, 56, 92, 0.1)', color: 'var(--primary)' }">
                                    {{ getWorkspace(project.workspaceId)?.name }}
                                </span>
                            </h5>
                            <p class="text-muted small mb-3">{{ project.goal }}</p>
                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <small class="text-muted">Progress</small>
                                    <small>{{ project.progress }}%</small>
                                </div>
                                <div class="progress" style="height: 4px;">
                                    <div class="progress-bar" role="progressbar" 
                                         :style="{ width: project.progress + '%', backgroundColor: getProgressColor(project.progress) }" 
                                         :aria-valuenow="project.progress" aria-valuemin="0" aria-valuemax="100">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted d-block mb-2">Due {{ formatDate(project.deadline) }}</small>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0">
                            <button class="btn btn-sm btn-outline-secondary" @click="selectProject(project.id)">
                                View Tasks
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected Project View -->
            <div v-if="selectedProjectId">
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
                
                <!-- Project Information -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5 class="card-title mb-3">Project Details</h5>
                                <p class="mb-1"><span class="text-muted">Goal:</span> {{ selectedProject.goal }}</p>
                                <p class="mb-1"><span class="text-muted">Deadline:</span> {{ formatDate(selectedProject.deadline) }}</p>
                                <p><span class="text-muted">Team:</span> {{ getWorkspace(selectedProject.workspaceId)?.name }}</p>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="text-muted">Progress</span>
                                        <span>{{ selectedProject.progress }}%</span>
                                    </div>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar" role="progressbar" 
                                             :style="{ width: selectedProject.progress + '%', backgroundColor: getProgressColor(selectedProject.progress) }" 
                                             :aria-valuenow="selectedProject.progress" aria-valuemin="0" aria-valuemax="100">
                                        </div>
                                    </div>
                                </div>
                                <p class="mb-2 text-muted">Team Members:</p>
                                <div class="mt-1">
                                    <span v-for="userId in teamMembers" :key="userId" class="me-1">
                                        <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name" 
                                             class="assignee-avatar" :title="getUser(userId)?.name" width="30" height="30">
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filtering Controls -->
                <div class="card mb-4">
                    <div class="card-body pt-2 pb-2">
                        <div class="row align-items-center">
                            <div class="col-md-3 py-2">
                                <select class="form-select form-select-sm" v-model="filterAssignee">
                                    <option value="">Filter by Assignee</option>
                                    <option v-for="userId in teamMembers" :key="userId" :value="userId">{{ getUser(userId)?.name }}</option>
                                </select>
                            </div>
                            <div class="col-md-3 py-2">
                                <select class="form-select form-select-sm" v-model="filterPriority">
                                    <option value="">Filter by Priority</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                            <div class="col-md-3 py-2">
                                <input type="date" class="form-control form-control-sm" v-model="filterDeadline" title="Filter by Deadline on or before">
                            </div>
                            <div class="col-md-3 py-2 text-end">
                                <button class="btn btn-outline-secondary btn-sm" @click="clearFilters" v-if="isFiltered">Clear Filters</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Kanban View -->
                <div v-if="isKanbanView" class="row g-4">
                    <div v-for="status in statuses" :key="status" class="col-md-4">
                        <div class="card h-100 kanban-card">
                            <div class="card-header d-flex align-items-center justify-content-between" :class="getStatusHeaderClass(status)">
                                <h5 class="m-0">{{ status }}</h5>
                                <span class="badge bg-white text-dark">{{ filteredTasks(status).length }}</span>
                            </div>
                            <div class="card-body kanban-column" 
                                @dragover.prevent 
                                @drop="handleDrop(status, $event)">
                                <p class="text-muted small text-center mb-2" v-if="filteredTasks(status).length === 0">
                                    <i class="bi bi-arrow-down-square me-1"></i>
                                    Drop tasks here
                                </p>
                                <task-card
                                    v-for="task in filteredTasks(status)"
                                    :key="task.id"
                                    :task="task"
                                    @click="openTaskDetails(task)"
                                    draggable="true"
                                    @dragstart="handleDragStart(task, $event)">
                                </task-card>
                            </div>
                            <div class="card-footer bg-transparent text-center">
                                <button class="btn btn-sm btn-outline-primary" @click="openNewTaskModal(status)">
                                    <i class="bi bi-plus-lg"></i> Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- List View -->
                <div v-else class="list-view">
                    <div class="card">
                        <div class="card-body p-0">
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Assignee(s)</th>
                                        <th>Deadline</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="task in currentFilteredTasks" :key="task.id">
                                        <td>{{ task.title }}</td>
                                        <td>
                                            <span v-for="userId in task.assignees" :key="userId" class="me-1">
                                                <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name" class="assignee-avatar" :title="getUser(userId)?.name">
                                            </span>
                                        </td>
                                        <td>{{ formatDate(task.deadline) }}</td>
                                        <td><span :class="['badge', getPriorityClass(task.priority)]">{{ task.priority }}</span></td>
                                        <td>{{ task.status }}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-secondary" @click="openTaskDetails(task)">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="currentFilteredTasks.length === 0">
                                        <td colspan="6" class="text-center text-muted p-4">No tasks match the current filters.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- New Task Modal -->
            <div class="modal fade" id="newTaskModal" tabindex="-1" aria-labelledby="newTaskModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="newTaskModalLabel">Create New Task</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
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
                                        <select class="form-select" id="taskProject" v-model="newTask.projectId">
                                            <option v-for="project in projects" :key="project.id" :value="project.id">
                                                {{ project.title }} ({{ getWorkspace(project.workspaceId)?.name }})
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="taskAssignees" class="form-label">Assignee(s)</label>
                                        <select id="taskAssignees" class="form-select" multiple v-model="newTask.assignees">
                                            <option v-for="user in getTeamMembersForTask" :key="user.id" :value="user.id">{{ user.name }}</option>
                                        </select>
                                        <div class="form-text" v-if="newTask.assignees.length > 0">
                                            <span v-for="userId in newTask.assignees" :key="userId" class="me-2">
                                                {{ getUser(userId)?.name }}: <span :class="getWorkloadClass(getUser(userId)?.workload)">{{ getUser(userId)?.workload }} workload</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="taskDeadline" class="form-label">Deadline</label>
                                        <input type="date" class="form-control" id="taskDeadline" v-model="newTask.deadline">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="taskPriority" class="form-label">Priority</label>
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

            <!-- Task Details Modal -->
            <div class="modal fade" id="taskDetailsModal" tabindex="-1" aria-labelledby="taskDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="taskDetailsModalLabel">{{ selectedTask?.title }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="selectedTask">
                                <div class="mb-4">
                                    <span :class="['badge me-2', getPriorityClass(selectedTask.priority)]">{{ selectedTask.priority }}</span>
                                    <span class="badge" :style="{ backgroundColor: 'rgba(255, 56, 92, 0.1)', color: 'var(--primary)' }">{{ selectedTask.status }}</span>
                                </div>
                                
                                <div class="mb-4">
                                    <h6 class="text-muted small">PROJECT</h6>
                                    <p>{{ getProject(selectedTask.projectId)?.title || 'N/A' }}</p>
                                </div>
                                
                                <div class="mb-4">
                                    <h6 class="text-muted small">DESCRIPTION</h6>
                                    <p>{{ selectedTask.description || 'No description provided' }}</p>
                                </div>
                                
                                <div class="mb-4">
                                    <h6 class="text-muted small">ASSIGNEES</h6>
                                    <div class="d-flex align-items-center mb-2" v-for="userId in selectedTask.assignees" :key="userId">
                                        <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name" class="assignee-avatar me-2">
                                        <span>{{ getUser(userId)?.name }}</span>
                                    </div>
                                </div>
                                
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <h6 class="text-muted small">DEADLINE</h6>
                                        <p>{{ formatDate(selectedTask.deadline) || 'No deadline set' }}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6 class="text-muted small">TEAM</h6>
                                        <p>{{ getWorkspace(selectedTask.workspaceId)?.name || 'N/A' }}</p>
                                    </div>
                                </div>
                                
                                <hr class="my-4">
                                <h6 class="text-muted small">SUBTASKS</h6>
                                <p class="text-muted">(Subtask checklist would appear here)</p>
                                
                                <hr class="my-4">
                                <h6 class="text-muted small">COMMENTS</h6>
                                <p class="text-muted">(Comments section with @mentions would appear here)</p>
                                <div class="mb-3">
                                    <textarea class="form-control" placeholder="Add a comment..." rows="2"></textarea>
                                </div>
                                <button class="btn btn-sm btn-outline-secondary">Add Comment</button>
                                
                                <hr class="my-4">
                                <h6 class="text-muted small">ACTIVITY</h6>
                                <p class="text-muted">(Activity log would appear here)</p>
                            </div>
                            <div v-else>
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
        </div>
    `,
    data() {
        return {
            isKanbanView: true,
            selectedProjectId: null,
            statuses: ['To Do', 'In Progress', 'Done'],

            // Users data
            users: [
                { id: 1, name: 'Maria Lluïsa', avatar: 'https://placehold.co/30/007bff/ffffff?text=ML', workload: 'Medium', role: 'Project Manager' },
                { id: 2, name: 'Alex', avatar: 'https://placehold.co/30/28a745/ffffff?text=A', workload: 'Medium', role: 'Developer' },
                { id: 3, name: 'Ben', avatar: 'https://placehold.co/30/fd7e14/ffffff?text=B', workload: 'Low', role: 'Designer' },
                { id: 4, name: 'Chloe', avatar: 'https://placehold.co/30/6f42c1/ffffff?text=C', workload: 'High', role: 'Business Analyst' },
                { id: 5, name: 'David', avatar: 'https://placehold.co/30/20c997/ffffff?text=D', workload: 'Medium', role: 'Tech Lead' },
                { id: 6, name: 'Eva', avatar: 'https://placehold.co/30/e83e8c/ffffff?text=E', workload: 'High', role: 'UX Designer' },
                { id: 7, name: 'Finn', avatar: 'https://placehold.co/30/ffc107/000000?text=F', workload: 'Low', role: 'Marketing' }
            ],

            // Project definitions - now with 3 projects
            projects: [
                {
                    id: 1,
                    title: 'Q3 Internal Process Optimization',
                    goal: 'Streamline internal reporting workflows by end of Q3',
                    deadline: '2025-09-30',
                    progress: 25,
                    workspaceId: 1 // Belongs to Equip de Filosofia
                },
                {
                    id: 2,
                    title: 'New Client Portal Launch',
                    goal: 'Successfully launch the new client-facing portal by October 31st',
                    deadline: '2025-10-31',
                    progress: 15,
                    workspaceId: 2 // Belongs to Equip de Factors Humans
                },
                {
                    id: 3,
                    title: 'Social Media Integration',
                    goal: 'Integrate social media dashboard into existing platform',
                    deadline: '2025-11-15',
                    progress: 5,
                    workspaceId: 2 // Belongs to Equip de Factors Humans (second project)
                }
            ],

            // Workspace/Team definitions (reference data - not shown in this view)
            workspaces: [
                {
                    id: 1,
                    name: 'Equip de Filosofia',
                    description: 'Team focused on philosophical approach to product development',
                    members: [1, 2, 3, 4], // Maria Lluïsa, Alex, Ben, Chloe
                    projects: [1] // Project 1: Internal Process Optimization
                },
                {
                    id: 2,
                    name: 'Equip de Factors Humans',
                    description: 'Team dedicated to human factors and user experience',
                    members: [1, 5, 6, 7], // Maria Lluïsa, David, Eva, Finn
                    projects: [2, 3] // Projects 2 & 3
                }
            ],

            // Current date used for deadline calculations
            currentDate: new Date('2025-05-05'),

            // Tasks for the projects
            tasks: [
                // Project 1 tasks (Equip de Filosofia)
                {
                    id: 1,
                    title: 'Map current reporting process',
                    description: 'Document the existing reporting workflow including all stakeholders and touchpoints.',
                    assignees: [2], // Alex
                    deadline: '2025-05-15',
                    priority: 'High',
                    status: 'To Do',
                    projectId: 1,
                    workspaceId: 1
                },
                {
                    id: 2,
                    title: 'Identify bottlenecks in reporting',
                    description: 'Analyze the current process and identify key inefficiencies and pain points.',
                    assignees: [3], // Ben
                    deadline: '2025-05-20',
                    priority: 'Medium',
                    status: 'To Do',
                    projectId: 1,
                    workspaceId: 1
                },
                {
                    id: 3,
                    title: 'Draft proposal for new workflow',
                    description: 'Create a comprehensive proposal for the improved reporting workflow with justifications.',
                    assignees: [4], // Chloe
                    deadline: '2025-06-01',
                    priority: 'High',
                    status: 'To Do',
                    projectId: 1,
                    workspaceId: 1
                },

                // Project 2 tasks (Client Portal - Equip de Factors Humans)
                {
                    id: 4,
                    title: 'Finalize UI design mockups',
                    description: 'Complete all UI design mockups for the client portal including responsive views.',
                    assignees: [5, 6], // David, Eva
                    deadline: '2025-05-15',
                    priority: 'Urgent',
                    status: 'In Progress',
                    projectId: 2,
                    workspaceId: 2
                },
                {
                    id: 5,
                    title: 'Develop authentication module',
                    description: 'Build the authentication system including login, password reset, and session management.',
                    assignees: [5], // David
                    deadline: '2025-05-30',
                    priority: 'High',
                    status: 'To Do',
                    projectId: 2,
                    workspaceId: 2
                },
                {
                    id: 6,
                    title: 'Plan user acceptance testing',
                    description: 'Develop comprehensive UAT plan including test cases, participant selection, and feedback collection.',
                    assignees: [7], // Finn
                    deadline: '2025-06-10',
                    priority: 'Medium',
                    status: 'To Do',
                    projectId: 2,
                    workspaceId: 2
                },
                
                // Project 3 tasks (Social Media Integration - Equip de Factors Humans)
                {
                    id: 7,
                    title: 'Research API integrations',
                    description: 'Investigate social media platforms APIs and document integration requirements.',
                    assignees: [5], // David
                    deadline: '2025-05-15',
                    priority: 'Medium',
                    status: 'In Progress',
                    projectId: 3,
                    workspaceId: 2
                },
                {
                    id: 8,
                    title: 'Design social dashboard UI',
                    description: 'Create UI mockups for the social media dashboard with analytics views.',
                    assignees: [6], // Eva
                    deadline: '2025-05-25',
                    priority: 'High',
                    status: 'To Do',
                    projectId: 3,
                    workspaceId: 2
                },
                {
                    id: 9,
                    title: 'Draft social media strategy',
                    description: 'Develop content strategy and posting guidelines for social media integration.',
                    assignees: [7], // Finn
                    deadline: '2025-06-01',
                    priority: 'Medium',
                    status: 'To Do',
                    projectId: 3,
                    workspaceId: 2
                }
            ],

            newTask: {
                title: '',
                description: '',
                assignees: [],
                deadline: '',
                priority: 'Medium',
                status: 'To Do',
                projectId: null,
                workspaceId: null
            },
            selectedTask: null,
            taskDetailsModalInstance: null,
            newTaskModalInstance: null,
            draggedTask: null,

            // Filters
            filterAssignee: '',
            filterPriority: '',
            filterDeadline: '',
        };
    },
    computed: {
        selectedProject() {
            return this.projects.find(p => p.id === this.selectedProjectId);
        },
        teamMembers() {
            if (this.selectedProjectId) {
                const project = this.getProject(this.selectedProjectId);
                if (project) {
                    const workspace = this.getWorkspace(project.workspaceId);
                    if (workspace && workspace.members) {
                        return workspace.members;
                    }
                }
            }
            return [];
        },
        currentTasks() {
            if (this.selectedProjectId) {
                return this.tasks.filter(task => task.projectId === this.selectedProjectId);
            }
            return [];
        },
        currentFilteredTasks() {
            return this.currentTasks.filter(task => {
                const assigneeMatch = !this.filterAssignee || task.assignees.includes(parseInt(this.filterAssignee));
                const priorityMatch = !this.filterPriority || task.priority === this.filterPriority;
                const deadlineMatch = !this.filterDeadline || (task.deadline && task.deadline <= this.filterDeadline);
                return assigneeMatch && priorityMatch && deadlineMatch;
            });
        },
        isFiltered() {
            return this.filterAssignee || this.filterPriority || this.filterDeadline;
        },
        getTeamMembersForTask() {
            if (this.newTask.projectId) {
                const project = this.getProject(this.newTask.projectId);
                if (project) {
                    const workspace = this.getWorkspace(project.workspaceId);
                    if (workspace) {
                        return this.users.filter(user => workspace.members.includes(user.id));
                    }
                }
            }
            return this.users;
        }
    },
    methods: {
        selectProject(projectId) {
            this.selectedProjectId = projectId;
            const project = this.getProject(projectId);
            if (project) {
                this.newTask.projectId = projectId;
                this.newTask.workspaceId = project.workspaceId;
            }
        },
        goBack() {
            this.selectedProjectId = null;
        },
        getProject(id) {
            return this.projects.find(p => p.id === id);
        },
        getWorkspace(id) {
            return this.workspaces.find(w => w.id === id);
        },
        getProgressColor(progress) {
            if (progress < 25) return 'var(--warning)';
            if (progress < 75) return 'var(--primary)';
            return 'var(--success)';
        },
        getTeamHeaderClass(workspaceId) {
            return 'bg-dark text-white';
            switch(workspaceId) {
                case 1: return 'bg-info text-white';
                case 2: return 'bg-success text-white';
                default: return 'bg-secondary text-white';
            }
        },
        toggleView() {
            this.isKanbanView = !this.isKanbanView;
        },
        filteredTasks(status) {
            return this.currentFilteredTasks.filter(task => task.status === status);
        },
        getUser(userId) {
            return this.users.find(user => user.id === userId);
        },
        getAssigneeNames(assigneeIds) {
            if (!assigneeIds || assigneeIds.length === 0) return 'Unassigned';
            return assigneeIds.map(id => this.getUser(id)?.name || 'Unknown').join(', ');
        },
        getPriorityClass(priority) {
            switch (priority?.toLowerCase()) {
                case 'low': return 'bg-success text-light';
                case 'medium': return 'bg-warning text-dark';
                case 'high': return 'bg-danger text-light';
                case 'urgent': return 'bg-danger-emphasis text-light border border-light';
                default: return 'bg-secondary text-light';
            }
        },
        getWorkloadClass(workload) {
            switch (workload?.toLowerCase()) {
                case 'low': return 'text-success';
                case 'medium': return 'text-warning';
                case 'high': return 'text-danger';
                default: return 'text-muted';
            }
        },
        getStatusHeaderClass(status) {
            switch (status?.toLowerCase()) {
                case 'to do': return 'bg-primary';
                case 'in progress': return 'bg-warning';
                case 'done': return 'bg-success';
                default: return 'bg-secondary';
            }
        },
        createTask() {
            if (!this.newTask.title) return;
            
            // Set project's workspace if not already set
            if (this.newTask.projectId && !this.newTask.workspaceId) {
                const project = this.getProject(this.newTask.projectId);
                if (project) {
                    this.newTask.workspaceId = project.workspaceId;
                }
            }
            
            const newTaskToAdd = {
                id: Date.now(),
                ...this.newTask,
                assignees: this.newTask.assignees.map(id => parseInt(id)),
                subtasks: [],
                comments: []
            };
            this.tasks.push(newTaskToAdd);
            
            // Reset form
            this.newTask = {
                title: '',
                description: '',
                assignees: [],
                deadline: '',
                priority: 'Medium',
                status: 'To Do',
                projectId: this.selectedProjectId || null,
                workspaceId: this.selectedProject ? this.selectedProject.workspaceId : null
            };
            
            this.newTaskModalInstance.hide();
            console.log("Task created:", newTaskToAdd);
        },
        openTaskDetails(task) {
            this.selectedTask = task;
            this.taskDetailsModalInstance.show();
        },
        openNewTaskModal(status) {
            if (status) {
                this.newTask.status = status;
            }
            
            // Pre-select current project if viewing a project
            if (this.selectedProjectId) {
                this.newTask.projectId = this.selectedProjectId;
                const project = this.getProject(this.selectedProjectId);
                if (project) {
                    this.newTask.workspaceId = project.workspaceId;
                }
            }
            
            this.newTaskModalInstance.show();
        },
        simulateImport() {
            console.log("Simulating task import...");
            alert("Task import initiated (Simulated). Check console for details.");
        },
        clearFilters() {
            this.filterAssignee = '';
            this.filterPriority = '';
            this.filterDeadline = '';
        },
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString + 'T00:00:00'); // Avoid timezone issues
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } catch (e) {
                return dateString; // Fallback
            }
        },
        handleDragStart(task, event) {
            console.log('Dragging task:', task.id);
            this.draggedTask = task;
            event.dataTransfer.effectAllowed = 'move';
        },
        handleDrop(targetStatus, event) {
            event.preventDefault();
            if (!this.draggedTask) return;

            console.log(`Dropping task ${this.draggedTask.id} onto status ${targetStatus}`);

            const taskIndex = this.tasks.findIndex(t => t.id === this.draggedTask.id);
            if (taskIndex !== -1 && this.tasks[taskIndex].status !== targetStatus) {
                this.tasks[taskIndex].status = targetStatus;
                console.log(`Task ${this.draggedTask.id} status updated to ${targetStatus}`);
            }
            this.draggedTask = null;
        }
    },
    mounted() {
        // Initialize Bootstrap Modals after the component is mounted
        const taskDetailsModalEl = document.getElementById('taskDetailsModal');
        if (taskDetailsModalEl) {
            this.taskDetailsModalInstance = new bootstrap.Modal(taskDetailsModalEl);
        }
        const newTaskModalEl = document.getElementById('newTaskModal');
        if (newTaskModalEl) {
            this.newTaskModalInstance = new bootstrap.Modal(newTaskModalEl);
        }
        console.log('Projects view component mounted.');
    },
    beforeUnmount() {
        // Clean up modal instances to prevent memory leaks
        this.taskDetailsModalInstance?.dispose();
        this.newTaskModalInstance?.dispose();
    }
};
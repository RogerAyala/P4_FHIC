// js/components/TeamWorkspace.js

// Make sure TaskCard is available by defining it here if it's not imported
let TaskCard;
if (typeof window !== 'undefined') {
    TaskCard = window.TaskCard;
}

window.TeamWorkspace = {
    components: {
        'task-card': TaskCard // Register TaskCard locally
    },
    template: `
        <div class="team-workspace-view container-fluid">
            <!-- Team Navigation -->
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

            <!-- Team Selection (Initial View) -->
            <div v-if="!selectedWorkspaceId" class="row g-4 mb-4">
                <div v-for="workspace in workspaces" :key="workspace.id" class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="mb-3">{{ workspace.name }}</h5>
                            <p class="text-muted small mb-4">{{ workspace.description }}</p>
                            <div class="mb-3">
                                <p class="mb-2 text-muted small">TEAM MEMBERS</p>
                                <div>
                                    <span v-for="userId in workspace.members" :key="userId" class="me-1">
                                        <img :src="getUser(userId)?.avatar" :alt="getUser(userId)?.name" 
                                             class="assignee-avatar" :title="getUser(userId)?.name" width="28" height="28">
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p class="mb-2 text-muted small">PROJECTS</p>
                                <div>
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
                            <button class="btn btn-sm btn-outline-secondary" @click="selectWorkspace(workspace.id)">
                                View Team
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Selected Team View -->
            <div v-if="selectedWorkspaceId">
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

                <!-- Team Information -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-lg-8">
                                <h5 class="card-title mb-3">Team Members</h5>
                                <div class="d-flex flex-wrap">
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

                <!-- Filtering Controls -->
                <div class="card mb-4">
                    <div class="card-body pt-2 pb-2">
                        <div class="row align-items-center">
                            <div class="col-md-3 py-2">
                                <select class="form-select form-select-sm" v-model="filterAssignee">
                                    <option value="">Filter by Assignee</option>
                                    <option v-for="user in teamMembers" :key="user.id" :value="user.id">{{ user.name }}</option>
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
                                        <th>Project</th>
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
                                        <td>{{ getProject(task.projectId)?.title || 'N/A' }}</td>
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
            <!-- New Task Modal -->
            <div class="modal fade" id="newTaskModal" tabindex="-1" aria-labelledby="newTaskModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="newTaskModalLabel">Create New Team Task</h5>
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
                                            <option value="">No Project</option>
                                            <option v-for="projectId in selectedWorkspace?.projects" :key="projectId" :value="projectId">
                                                {{ getProject(projectId)?.title }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="taskAssignees" class="form-label">Assignee(s)</label>
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
        </teleport>
    `,
    data() {
        return {
            isKanbanView: true,
            selectedWorkspaceId: null,
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

            // Project definitions (reference data)
            projects: [
                {
                    id: 1,
                    title: 'Q3 Internal Process Optimization',
                    goal: 'Streamline internal reporting workflows by end of Q3',
                    deadline: '2025-09-30',
                    progress: 25,
                    workspaceId: 1
                },
                {
                    id: 2,
                    title: 'New Client Portal Launch',
                    goal: 'Successfully launch the new client-facing portal by October 31st',
                    deadline: '2025-10-31',
                    progress: 15,
                    workspaceId: 2
                },
                {
                    id: 3,
                    title: 'Social Media Integration',
                    goal: 'Integrate social media dashboard into existing platform',
                    deadline: '2025-11-15',
                    progress: 5,
                    workspaceId: 2
                }
            ],

            // Workspace/Team definitions
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

            // Tasks data
            tasks: [
                // Team 1 (Equip de Filosofia) tasks
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
                {
                    id: 10,
                    title: 'Team training session',
                    description: 'Organize and conduct team training on new methodologies',
                    assignees: [1, 2, 3, 4], // All team members
                    deadline: '2025-05-25',
                    priority: 'Medium',
                    status: 'To Do',
                    projectId: null, // No specific project
                    workspaceId: 1
                },

                // Team 2 (Equip de Factors Humans) tasks
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
                },
                {
                    id: 11,
                    title: 'Monthly team retrospective',
                    description: 'Review team progress and plan improvements for next sprint',
                    assignees: [1, 5, 6, 7], // All team members
                    deadline: '2025-05-30',
                    priority: 'High',
                    status: 'To Do',
                    projectId: null, // No specific project
                    workspaceId: 2
                }
            ],

            // New task template
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
        selectedWorkspace() {
            return this.workspaces.find(w => w.id === this.selectedWorkspaceId);
        },
        teamMembers() {
            if (this.selectedWorkspaceId) {
                const workspace = this.getWorkspace(this.selectedWorkspaceId);
                return workspace ? this.users.filter(user => workspace.members.includes(user.id)) : [];
            }
            return [];
        },
        currentTasks() {
            if (this.selectedWorkspaceId) {
                return this.tasks.filter(task => task.workspaceId === this.selectedWorkspaceId);
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
        }
    },
    methods: {
        selectWorkspace(workspaceId) {
            this.selectedWorkspaceId = workspaceId;
            if (workspaceId) {
                this.newTask.workspaceId = workspaceId;
            }
        },
        goBack() {
            this.selectedWorkspaceId = null;
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
        getProgressBadgeClass(progress) {
            if (!progress) return 'bg-secondary';
            if (progress < 25) return 'bg-danger';
            if (progress < 50) return 'bg-warning text-dark';
            if (progress < 75) return 'bg-primary';
            return 'bg-success';
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
        getTaskStatusCount(status) {
            return this.currentTasks.filter(task => task.status === status).length;
        },
        getTaskStatusPercentage(status) {
            const totalTasks = this.currentTasks.length;
            if (totalTasks === 0) return 0;
            return Math.round((this.getTaskStatusCount(status) / totalTasks) * 100);
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
        getStatusHeaderClass(status) {
            switch (status?.toLowerCase()) {
                case 'to do': return 'bg-primary';
                case 'in progress': return 'bg-warning';
                case 'done': return 'bg-success';
                default: return 'bg-secondary';
            }
        },
        createTask() {
            if (!this.newTask.title || !this.selectedWorkspaceId) return;
            
            // Set workspace ID for new task
            this.newTask.workspaceId = this.selectedWorkspaceId;
            
            const newTaskToAdd = {
                id: Date.now(),
                ...this.newTask,
                assignees: this.newTask.assignees.map(id => parseInt(id))
            };
            
            this.tasks.push(newTaskToAdd);
            
            // Reset form while keeping the current workspace ID
            const currentWorkspaceId = this.selectedWorkspaceId;
            this.newTask = {
                title: '',
                description: '',
                assignees: [],
                deadline: '',
                priority: 'Medium',
                status: 'To Do',
                projectId: null,
                workspaceId: currentWorkspaceId
            };
            
            this.newTaskModalInstance.hide();
            console.log("Team task created:", newTaskToAdd);
        },
        openTaskDetails(task) {
            // Hide mobile overlay if active
            const overlay = document.querySelector('.mobile-overlay');
            if (overlay && overlay.classList.contains('active')) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            this.selectedTask = task;
            this.taskDetailsModalInstance.show();
        },
        openNewTaskModal(status) {
            // Hide mobile overlay if active
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
                const date = new Date(dateString + 'T00:00:00');
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } catch (e) {
                return dateString;
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
        // Initialize Bootstrap Modals
        const taskDetailsModalEl = document.getElementById('taskDetailsModal');
        if (taskDetailsModalEl) {
            // Explicitly set backdrop and keyboard options
            this.taskDetailsModalInstance = new bootstrap.Modal(taskDetailsModalEl, {
                backdrop: true, // Default, but explicit
                keyboard: true  // Default, but explicit
            });
        }
        const newTaskModalEl = document.getElementById('newTaskModal');
        if (newTaskModalEl) {
            // Explicitly set backdrop and keyboard options
            this.newTaskModalInstance = new bootstrap.Modal(newTaskModalEl, {
                backdrop: true, // Default, but explicit
                keyboard: true  // Default, but explicit
            });
        }
        console.log('Team Workspace component mounted.');
    },
    beforeUnmount() {
        // Clean up modal instances
        this.taskDetailsModalInstance?.dispose();
        this.newTaskModalInstance?.dispose();
    }
};

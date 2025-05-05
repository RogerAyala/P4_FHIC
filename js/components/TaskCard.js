// js/components/TaskCard.js

window.TaskCard = {
    props: {
        task: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="task-card" :class="{'border-start border-4': true, [getPriorityBorderClass(task.priority)]: true}">
            <div class="d-flex align-items-center mb-2">
                <span :class="['priority-indicator', getPriorityColorClass(task.priority)]" :title="'Prioritat: ' + task.priority"></span>
                <h5 class="card-title fs-6 mb-0">{{ task.title }}</h5>
                <div class="ms-auto">
                    <span v-if="task.deadline" class="badge bg-light text-dark border small" :title="'Data límit: ' + task.deadline">
                        <i class="bi bi-calendar-event"></i> {{ formatDate(task.deadline) }}
                    </span>
                </div>
            </div>
            
            <p class="card-text small mb-2" v-if="task.description">
                {{ truncate(task.description, 50) }}
            </p>
            
            <div class="d-flex justify-content-between align-items-center">
                <div class="task-meta d-flex align-items-center gap-2">
                    <span class="badge rounded-pill" :class="getStatusClass(task.status)">{{ task.status }}</span>
                </div>
                <!-- Assignats -->
                <div class="assignees">
                     <span v-for="userId in task.assignees" :key="userId" class="me-n1">
                         <img :src="getUserAvatar(userId)" :alt="getAssigneeTooltip(userId)" class="assignee-avatar" :title="getAssigneeTooltip(userId)">
                     </span>
                </div>
            </div>
        </div>
    `,
    methods: {
        truncate(text, length) {
            if (!text || text.length <= length) {
                return text;
            }
            return text.substring(0, length) + '...';
        },
        getPriorityColorClass(priority) {
            switch (priority?.toLowerCase()) {
                case 'low': return 'prioritat-baixa';
                case 'medium': return 'prioritat-mitjana';
                case 'high': return 'prioritat-alta';
                case 'urgent': return 'prioritat-urgent';
                default: return '';
            }
        },
        getPriorityBorderClass(priority) {
            switch (priority?.toLowerCase()) {
                case 'low': return 'border-èxit';
                case 'medium': return 'border-avís';
                case 'high': return 'border-taronja';
                case 'urgent': return 'border-perill';
                default: return 'border-secundari';
            }
        },
        getStatusClass(status) {
            switch (status?.toLowerCase()) {
                case 'to do': return 'bg-secundari';
                case 'in progress': return 'bg-principal';
                case 'done': return 'bg-èxit';
                default: return 'bg-secundari';
            }
        },
        formatDate(dateString) {
            if (!dateString) return '';
            try {
                const date = new Date(dateString + 'T00:00:00'); // Evitar problemes de zona horària establint l'hora
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            } catch (e) {
                return dateString; // Alternativa
            }
        },
        // Aquests mètodes assumeixen accés a les dades d'usuari del pare.
        // Això no és ideal. Millors maneres:
        // 1. Passar les dades dels usuaris com a prop.
        // 2. Utilitzar provide/inject.
        // 3. Utilitzar un gestor d'estat global (Pinia/Vuex).
        getUser(userId) {
            // Intentar accedir als usuaris des del component pare TeamWorkspace
            const parentUsers = this.$parent?.users || this.$root?.users || [];
            return parentUsers.find(user => user.id === userId);
        },
        getUserAvatar(userId) {
            const user = this.getUser(userId);
            return user ? user.avatar : 'https://placehold.co/30/cccccc/ffffff?text=?'; // Avatar per defecte
        },
        getAssigneeTooltip(userId) {
            const user = this.getUser(userId);
            return user ? user.name : 'Usuari desconegut';
        }
    }
};

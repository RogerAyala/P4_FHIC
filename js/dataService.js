// Aquest fitxer conté el servei per gestionar les dades de l'aplicació.
// Utilitza localStorage per guardar i carregar les dades, així que persistiran entre sessions.

(function() {
  // Clau per guardar les dades a localStorage.
  const STORAGE_KEY = 'timeit_data';

  // Dades per defecte que es carreguen si no hi ha res a localStorage.
  // Inclou llistes d'usuaris, espais de treball, projectes i tasques amb informació predefinida.
  const defaultData = {
    users: [
      { id: 1, name: 'Maria Lluïsa', avatar: 'https://placehold.co/30/007bff/ffffff?text=ML', workload: 'Medium', role: 'Project Manager' },
      { id: 2, name: 'Alex', avatar: 'https://placehold.co/30/28a745/ffffff?text=A', workload: 'Medium', role: 'Developer' },
      { id: 3, name: 'Ben', avatar: 'https://placehold.co/30/fd7e14/ffffff?text=B', workload: 'Low', role: 'Designer' },
      { id: 4, name: 'Chloe', avatar: 'https://placehold.co/30/6f42c1/ffffff?text=C', workload: 'High', role: 'Business Analyst' },
      { id: 5, name: 'David', avatar: 'https://placehold.co/30/20c997/ffffff?text=D', workload: 'Medium', role: 'Tech Lead' },
      { id: 6, name: 'Eva', avatar: 'https://placehold.co/30/e83e8c/ffffff?text=E', workload: 'High', role: 'UX Designer' },
      { id: 7, name: 'Finn', avatar: 'https://placehold.co/30/ffc107/000000?text=F', workload: 'Low', role: 'Marketing' }
    ],
    workspaces: [
      { id: 1, name: 'Equip de Filosofia', description: 'Team focused on philosophical approach to product development', members: [1,2,3,4], projects: [1] },
      { id: 2, name: 'Equip de Factors Humans', description: 'Team dedicated to human factors and user experience', members: [1,5,6,7], projects: [2,3] }
    ],
    projects: [
      { id: 1, title: 'Q3 Internal Process Optimization', goal: 'Streamline internal reporting workflows by end of Q3', deadline: '2025-09-30', progress:25, workspaceId:1 },
      { id: 2, title: 'New Client Portal Launch', goal: 'Successfully launch the new client-facing portal by October 31st', deadline: '2025-10-31', progress:15, workspaceId:2 },
      { id: 3, title: 'Social Media Integration', goal: 'Integrate social media dashboard into existing platform', deadline: '2025-11-15', progress:5, workspaceId:2 }
    ],
    tasks: [
      // Tasques per al Projecte 1
      { id: 1, title: 'Map current reporting process', description: 'Document existing workflow', assignees:[2], deadline:'2025-05-15', priority:'High', status:'To Do', projectId:1, workspaceId:1 },
      { id: 2, title: 'Identify bottlenecks in reporting', description: 'Analyze current process', assignees:[3], deadline:'2025-05-20', priority:'Medium', status:'To Do', projectId:1, workspaceId:1 },
      { id: 3, title: 'Draft proposal for new workflow', description:'Create comprehensive proposal', assignees:[4], deadline:'2025-06-01', priority:'High', status:'To Do', projectId:1, workspaceId:1 },
      // Tasques per al Projecte 2
      { id:4, title:'Finalize UI design mockups', description:'Complete UI mockups', assignees:[5,6], deadline:'2025-05-15', priority:'Urgent', status:'In Progress', projectId:2, workspaceId:2 },
      { id:5, title:'Develop authentication module', description:'Build auth system', assignees:[5], deadline:'2025-05-30', priority:'High', status:'To Do', projectId:2, workspaceId:2 },
      { id:6, title:'Plan user acceptance testing', description:'Develop UAT plan', assignees:[7], deadline:'2025-06-10', priority:'Medium', status:'To Do', projectId:2, workspaceId:2 },
      // Tasques per al Projecte 3
      { id:7, title:'Research API integrations', description:'Investigate APIs', assignees:[5], deadline:'2025-05-15', priority:'Medium', status:'In Progress', projectId:3, workspaceId:2 },
      { id:8, title:'Design social dashboard UI', description:'Create UI mockups', assignees:[6], deadline:'2025-05-25', priority:'High', status:'To Do', projectId:3, workspaceId:2 },
      { id:9, title:'Draft social media strategy', description:'Develop content strategy', assignees:[7], deadline:'2025-06-01', priority:'Medium', status:'To Do', projectId:3, workspaceId:2 }
    ]
  };

  // Funció per carregar les dades des de localStorage.
  // Si no troba res (primer cop), carrega les dades per defecte.
  // Utilitza JSON.parse per convertir el text guardat a objectes JavaScript.
  // La part JSON.parse(JSON.stringify(defaultData)) és per fer una copia profunda de les dades per defecte.
  function load() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(defaultData));
  }

  // Funció per guardar les dades actuals (l'objecte 'data') a localStorage.
  // Converteix l'objecte JavaScript a una cadena de text JSON per guardar-lo.
  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Exposem l'objecte DataService al scope global (window).
  // Aquest objecte és la interfície que utilitzarà la resta de l'aplicació
  // per accedir i modificar les dades.
  window.DataService = {
    // L'objecte principal que conté totes les dades, carregades a l'inici.
    data: load(),

    // Mètodes simples per obtenir les diferents llistes de dades.
    getUsers() { return this.data.users; },
    getWorkspaces() { return this.data.workspaces; },
    getProjects() { return this.data.projects; },
    getTasks() { return this.data.tasks; },

    // Mètode per reemplaçar completament la llista de tasques (per exemple, després de reordenar-les).
    // Un cop actualitzada la llista, es guarden les dades.
    saveTasks(tasks) { this.data.tasks = tasks; save(this.data); },

    // Mètode per crear una nova tasca.
    // Calcula un ID nou basant-se en els IDs existents.
    // Afegeix la nova tasca a la llista i guarda totes les dades.
    // Retorna la tasca creada, incloent el seu nou ID.
    createTask(task) {
      const newId = Math.max(0, ...this.data.tasks.map(t=>t.id)) +1;
      const newTask = { id:newId, ...task };
      this.data.tasks.push(newTask);
      save(this.data);
      return newTask;
    },

    // Mètode per actualitzar una tasca existent.
    // Busca la tasca per ID. Si la troba, la reemplaça amb la informació nova.
    // Un cop actualitzada (si s'ha trobat), es guarden les dades.
    updateTask(updated) {
      const idx = this.data.tasks.findIndex(t=>t.id===updated.id);
      if(idx>-1) {
        this.data.tasks.splice(idx,1,updated);
        save(this.data);
      }
      // Si la tasca no es troba (idx és -1), no fa res.
    }
  };
})();
// js/components/CalendarView.js

window.CalendarView = {
    template: `
        <div class="calendar-view animate__animated animate__fadeIn">
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between">
                    <h5 class="m-0">Calendar</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary me-2" @click="goToToday">Today</button>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" @click="previousMonth">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <button class="btn btn-outline-secondary" @click="nextMonth">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                        <button class="btn btn-sm btn-primary ms-2" @click="openAddEventModal">
                            <i class="bi bi-plus"></i> Add Event
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h3 class="text-center mb-4">{{ currentMonthYear }}</h3>
                    <div class="table-responsive">
                        <table class="table table-bordered calendar-table">
                            <thead>
                                <tr>
                                    <th v-for="day in weekDays" :key="day">{{ day }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(week, weekIndex) in calendarDays" :key="'week-' + weekIndex">
                                    <td v-for="(day, dayIndex) in week" :key="'day-' + dayIndex"
                                        :class="{
                                            'text-muted': day.isOutOfMonth,
                                            'bg-light': day.isToday,
                                            'has-events': hasEvents(day.date)
                                         }">
                                        {{ day.dayNumber }}
                                        <div v-for="event in getEventsForDay(day.date)"
                                             :key="event.id"
                                             :class="'calendar-event ' + event.colorClass"
                                             @click.stop="openEventDetails(event)">
                                             {{ event.title }}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer bg-light d-flex justify-content-between align-items-center">
                    <div class="calendar-legend d-flex align-items-center">
                        <span class="me-3"><i class="bi bi-circle-fill text-primary me-1"></i> Meeting</span>
                        <span class="me-3"><i class="bi bi-circle-fill text-success me-1"></i> Event</span>
                        <span class="me-3"><i class="bi bi-circle-fill text-danger me-1"></i> Deadline</span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-calendar3"></i> View
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" @click.prevent="switchView('month')">Month</a></li>
                            <li><a class="dropdown-item" href="#" @click.prevent="switchView('week')">Week</a></li>
                            <li><a class="dropdown-item" href="#" @click.prevent="switchView('day')">Day</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        // Aquí guardem les dades que el component necessita.
        // currentDate: La data actual que estem mostrant al calendari.
        // currentView: La vista actual ('month', 'week', 'day').
        // weekDays: Els noms dels dies de la setmana.
        // events: Una llista d'esdeveniments amb la seva data, títol i una classe de color.
        return {
            currentDate: new Date(2025, 4, 5), // 5 de maig de 2025
            currentView: 'month',
            weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            events: [
                { id: 1, title: 'Team Meeting', date: new Date(2025, 4, 5), colorClass: 'bg-primary' },
                { id: 2, title: 'Project Demo', date: new Date(2025, 4, 7), colorClass: 'bg-success' },
                { id: 3, title: 'Sprint Planning', date: new Date(2025, 4, 15), colorClass: 'bg-info' }
            ]
        };
    },
    computed: {
        currentMonthYear() {
            // Aquesta funció calculada retorna el mes i l'any actuals de la data mostrada,
            // formatats com a text (ex: "May 2025"). S'actualitza automàticament
            // quan canvia `currentDate`.
            return this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        },
        calendarDays() {
            // Aquesta funció calculada és la més complexa. Genera una matriu de setmanes,
            // on cada setmana és una matriu de dies. Cada dia conté informació
            // com el número del dia, la data completa, si està fora del mes actual
            // i si és el dia d'avui. Calcula quants dies del mes anterior i següent
            // s'han de mostrar per omplir la primera i l'última setmana.
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            const daysFromPrevMonth = firstDay.getDay();
            const daysFromNextMonth = 6 - lastDay.getDay();

            let calendarDays = [];
            let currentWeek = [];

            const prevMonthLastDay = new Date(year, month, 0).getDate();
            for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
                const dayNumber = prevMonthLastDay - i;
                const date = new Date(year, month - 1, dayNumber);
                currentWeek.push({
                    dayNumber,
                    date,
                    isOutOfMonth: true,
                    isToday: this.isToday(date)
                });
            }

            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(year, month, day);
                currentWeek.push({
                    dayNumber: day,
                    date,
                    isOutOfMonth: false,
                    isToday: this.isToday(date)
                });

                if (currentWeek.length === 7) {
                    calendarDays.push(currentWeek);
                    currentWeek = [];
                }
            }

            for (let day = 1; day <= daysFromNextMonth; day++) {
                const date = new Date(year, month + 1, day);
                currentWeek.push({
                    dayNumber: day,
                    date,
                    isOutOfMonth: true,
                    isToday: this.isToday(date)
                });

                if (currentWeek.length === 7) {
                    calendarDays.push(currentWeek);
                    currentWeek = [];
                }
            }

            if (currentWeek.length > 0) {
                calendarDays.push(currentWeek);
            }

            return calendarDays;
        }
    },
    methods: {
        isToday(date) {
            // Comprova si una data donada és avui.
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        },
        isSameDay(date1, date2) {
            // Comprova si dues dates són el mateix dia (ignorant l'hora).
            return date1.getDate() === date2.getDate() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getFullYear() === date2.getFullYear();
        },
        hasEvents(date) {
            // Comprova si una data té algun esdeveniment associat.
            return this.events.some(event => this.isSameDay(event.date, date));
        },
        getEventsForDay(date) {
            // Retorna tots els esdeveniments d'una data específica.
            return this.events.filter(event => this.isSameDay(event.date, date));
        },
        goToToday() {
            // Canvia la data mostrada al dia actual.
            this.currentDate = new Date();
            console.log('Calendar reset to today');
        },
        previousMonth() {
            // Canvia la data mostrada al mes anterior.
            this.currentDate = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth() - 1,
                1
            );
            console.log('Showing previous month:', this.currentMonthYear);
        },
        nextMonth() {
            // Canvia la data mostrada al mes següent.
            this.currentDate = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth() + 1,
                1
            );
            console.log('Showing next month:', this.currentMonthYear);
        },
        openAddEventModal() {
            // Simula l'obertura d'un modal per afegir un nou esdeveniment.
            console.log('Opening add event modal');
            alert('Funció fora dels escensaris de ús');
        },
        openEventDetails(event) {
            // Simula l'obertura d'un modal per veure els detalls d'un esdeveniment.
            console.log('Opening details for event:', event.id);
            alert(`Funció fora dels escensaris de ús`);
        },
        switchView(view) {
            // Canvia la vista del calendari (mes, setmana, dia).
            // Les vistes de setmana i dia no estan implementades completament.
            this.currentView = view;
            console.log(`Switched to ${view} view`);
            if (view !== 'month') {
                alert(`Funció fora dels escensaris de ús.`);
            }
        }
    },
    mounted() {
        // Aquesta funció s'executa un cop el component s'ha muntat al DOM.
        console.log('Calendar view component mounted.');
    }
};
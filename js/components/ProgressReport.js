const ProgressReport = {
    template: `
        <div class="progress-report-view container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Progress & Evaluation</h2>
                <button class="btn btn-outline-primary" @click="simulateExport">
                    <i class="bi bi-download me-2"></i> Export Report
                </button>
            </div>

            <p class="lead text-muted mb-4">Track your productivity, analyze performance, and identify opportunities for improvement.</p>

            <!-- Opcions per filtrar les dades dels informes -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-white">
                    <i class="bi bi-funnel me-2"></i> Filter Options
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-5">
                            <label for="progressScope" class="form-label fw-medium">Select Scope</label>
                            <select id="progressScope" class="form-select" v-model="selectedScope" @change="updateCharts">
                                <option value="personal">Personal</option>
                                <option value="project_alpha">Project Alpha (Team)</option>
                                <!-- Es podrien afegir més projectes/equips aquí dinàmicament -->
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="progressPeriod" class="form-label fw-medium">Select Time Period</label>
                            <select id="progressPeriod" class="form-select" v-model="selectedPeriod" @change="updateCharts">
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="quarter">Last Quarter</option>
                            </select>
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button class="btn btn-outline-primary w-100" @click="updateCharts">
                                <i class="bi bi-arrow-clockwise me-1"></i> Refresh Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Secció principal amb les gràfiques i anàlisis -->
            <div class="row g-4">
                <!-- Gràfica de Progrés General -->
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 class="m-0"><i class="bi bi-pie-chart me-2"></i> Overall Progress</h5>
                            <span class="badge bg-primary-light text-primary">{{ overallProgressData.datasets[0].data[0] }}%</span>
                        </div>
                        <div class="card-body d-flex justify-content-center align-items-center">
                            <!-- Canvas on es renderitza la gràfica de donut -->
                            <canvas id="overallProgressChart"></canvas>
                        </div>
                        <div class="card-footer text-center text-muted">
                            <!-- Barra de progrés visual -->
                            <div class="progress" style="height: 4px;">
                                <div class="progress-bar bg-primary" role="progressbar"
                                     :style="{ width: overallProgressData.datasets[0].data[0] + '%' }"
                                     :aria-valuenow="overallProgressData.datasets[0].data[0]"
                                     aria-valuemin="0" aria-valuemax="100">
                                </div>
                            </div>
                            <div class="mt-2 small">{{ overallProgressData.datasets[0].data[0] }}% Complete / {{ overallProgressData.datasets[0].data[1] }}% Remaining</div>
                        </div>
                    </div>
                </div>

                <!-- Gràfica de Tendències de Productivitat (línia) -->
                <div class="col-md-8">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-white">
                            <i class="bi bi-bar-chart-line me-2"></i> Productivity Trends
                        </div>
                        <div class="card-body">
                             <!-- Canvas on es renderitza la gràfica de línia -->
                            <canvas id="productivityTrendsChart"></canvas>
                        </div>
                        <div class="card-footer d-flex justify-content-between text-muted">
                            <div>
                                <i class="bi bi-info-circle me-1"></i> Shows tasks completed over time
                            </div>
                            <div>
                                <span class="badge bg-light text-primary border">Average: 17 tasks</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gràfica d'Adherència a Terminis (pastís) -->
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-white">
                            <i class="bi bi-calendar-check me-2"></i> Deadline Adherence
                        </div>
                        <div class="card-body d-flex justify-content-center align-items-center">
                             <!-- Canvas on es renderitza la gràfica de pastís -->
                            <canvas id="deadlineAdherenceChart"></canvas>
                        </div>
                        <div class="card-footer">
                            <div class="d-flex justify-content-center gap-4 text-center">
                                <div>
                                    <div class="text-success fw-medium">{{ deadlineAdherenceData.datasets[0].data[1] }}%</div>
                                    <div class="text-muted small">Early</div>
                                </div>
                                <div>
                                    <div class="text-primary fw-medium">{{ deadlineAdherenceData.datasets[0].data[0] }}%</div>
                                    <div class="text-muted small">On Time</div>
                                </div>
                                <div>
                                    <div class="text-danger fw-medium">{{ deadlineAdherenceData.datasets[0].data[2] }}%</div>
                                    <div class="text-muted small">Late</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Secció d'Anàlisi Intel·ligent i Recomanacions AI -->
                <div class="col-md-8">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 class="m-0"><i class="bi bi-magic me-2"></i> Smart Analysis & Recommendations</h5>
                            <button class="btn btn-sm btn-outline-primary" @click="simulateAdjustRecommendations">
                                <i class="bi bi-sliders me-1"></i> Adjust
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <!-- Llistat de diferents 'insights' o recomanacions -->
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex py-3">
                                    <div class="flex-shrink-0 me-3">
                                        <div class="insight-icon bg-warning-light text-warning rounded p-2">
                                            <i class="bi bi-lightbulb"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Productivity Pattern Detected</h6>
                                        <p class="mb-0 text-muted small">You seem most productive on Tuesday mornings based on recent task completions.</p>
                                    </div>
                                </li>
                                <li class="list-group-item d-flex py-3">
                                    <div class="flex-shrink-0 me-3">
                                        <div class="insight-icon bg-danger-light text-danger rounded p-2">
                                            <i class="bi bi-exclamation-triangle"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Risk Alert</h6>
                                        <p class="mb-0 text-muted small">Project Alpha is potentially at risk due to 3 overdue 'Urgent' tasks.</p>
                                    </div>
                                </li>
                                <li class="list-group-item d-flex py-3">
                                    <div class="flex-shrink-0 me-3">
                                        <div class="insight-icon bg-success-light text-success rounded p-2">
                                            <i class="bi bi-check2-circle"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Efficiency Suggestion</h6>
                                        <p class="mb-0 text-muted small">Consider breaking down 'Develop API Endpoint' into smaller subtasks for easier tracking.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Secció d'Objectius (OKR - Objectives and Key Results) -->
            <div class="card border-0 shadow-sm mt-5">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 class="m-0 d-flex align-items-center">
                        <i class="bi bi-bullseye me-2"></i> Objectives & Key Results
                    </h5>
                    <button class="btn btn-sm btn-outline-primary d-flex align-items-center">
                        <i class="bi bi-plus-lg me-1"></i> New Objective
                    </button>
                </div>
                <div class="card-body p-4">
                    <!-- Exemple d'una targeta d'objectiu individual -->
                    <div class="objective-card p-4 mb-3 border rounded">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="m-0 fw-semibold">Improve Team Velocity</h6>
                            <span class="badge bg-success-light text-success">On Track</span>
                        </div>
                        <p class="text-muted small mb-3">Increase team productivity by 20% by end of Q2 through process optimization.</p>

                        <!-- Barra de progrés per l'objectiu -->
                        <div class="progress mb-2" style="height: 6px;">
                            <div class="progress-bar bg-primary" role="progressbar" style="width: 65%" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="d-flex justify-content-between text-muted small">
                            <span>Started: Apr 1, 2025</span>
                            <span class="fw-medium">65% Complete</span>
                            <span>Due: Jun 30, 2025</span>
                        </div>
                    </div>

                    <!-- Espai per afegir més objectius -->
                    <div class="text-center py-4 border border-dashed rounded mt-3">
                        <i class="bi bi-plus-circle text-primary fs-4 mb-2"></i>
                        <p class="text-muted mb-0 small">Define SMART objectives and link them to tasks/projects</p>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            // Dades per controlar els filtres de l'informe
            selectedScope: 'personal',
            selectedPeriod: 'month',
            // Instàncies de Chart.js per poder actualitzar-les o destruir-les
            overallProgressChartInstance: null,
            productivityTrendsChartInstance: null,
            deadlineAdherenceChartInstance: null,
            // Dades d'exemple per les gràfiques (en una app real, vindrien d'una API)
            overallProgressData: {
                labels: ['Completed', 'Pending/Overdue'],
                datasets: [{
                    data: [67, 33], // Exemple: 67% completat
                    backgroundColor: ['#ff385c', '#f3f4f6'],
                    borderColor: ['#ff385c', '#f3f4f6'],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            },
            productivityTrendsData: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], // Exemple per 'month'
                datasets: [{
                    label: 'Tasks Completed',
                    data: [12, 19, 15, 22], // Dades d'exemple
                    fill: {
                        target: 'origin',
                        above: 'rgba(255, 56, 92, 0.08)'
                    },
                    borderColor: '#ff385c',
                    tension: 0.3,
                    borderWidth: 2,
                    pointBackgroundColor: '#ff385c',
                    pointRadius: 4
                }]
            },
            deadlineAdherenceData: {
                labels: ['On Time', 'Early', 'Late'],
                datasets: [{
                    data: [70, 10, 20], // Exemple: 70% a temps, 10% aviat, 20% tard
                    backgroundColor: ['#ff385c', '#00c07f', '#ff6b82'],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            }
        };
    },
    methods: {
        // Funció per crear una instància de gràfica Chart.js
        createChart(chartId, type, data, options = {}) {
            const ctx = document.getElementById(chartId);
            if (!ctx) {
                console.error(`Canvas element amb id "${chartId}" no trobat.`);
                return null;
            }
            // Destruir la instància de gràfica anterior si ja existeix per evitar conflictes
            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                existingChart.destroy();
            }

            try {
                // Crea i retorna la nova instància de gràfica
                return new Chart(ctx, {
                    type: type,
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                // La llegenda es mostra excepte en gràfiques de pastís/donut
                                display: type !== 'doughnut' && type !== 'pie' ? true : false,
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 6
                                }
                            },
                            tooltip: {
                                // Configuració per a l'aspecte dels tooltips de les gràfiques
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                titleColor: '#212529',
                                bodyColor: '#212529',
                                borderColor: '#dee2e6',
                                borderWidth: 1,
                                padding: 10,
                                boxPadding: 6,
                                usePointStyle: true,
                                callbacks: {
                                    label: function (context) {
                                        // Format personalitzat pel text del tooltip segons el tipus de gràfica
                                        if (type === 'pie' || type === 'doughnut') {
                                            return ` ${context.label}: ${context.raw}%`;
                                        }
                                        return ` ${context.dataset.label}: ${context.raw}`;
                                    }
                                }
                            }
                        },
                        ...options // Fusiona opcions personalitzades proporcionades
                    }
                });
            } catch (error) {
                console.error(`Error creant la gràfica "${chartId}":`, error);
                return null;
            }
        },
        // Mètode cridat quan canvien els filtres o es clica a 'Refresh Data'
        updateCharts() {
            console.log(`Actualitzant gràfiques per abast: ${this.selectedScope}, període: ${this.selectedPeriod}`);
            // Simula l'obtenció de noves dades basades en els filtres
            // En una aplicació real, aquí cridaries una API per obtenir les dades reals
            // Exemple: Actualitza les dades amb valors aleatoris per demostració
            this.overallProgressData.datasets[0].data = [Math.floor(Math.random() * 50) + 30, 100 - (Math.floor(Math.random() * 50) + 30)];
            this.productivityTrendsData.labels = this.getLabelsForPeriod(this.selectedPeriod);
            this.productivityTrendsData.datasets[0].data = this.productivityTrendsData.labels.map(() => Math.floor(Math.random() * 15) + 5);
            this.deadlineAdherenceData.datasets[0].data = this.generateRandomPercentages(3);

            // Re-crea les gràfiques amb les dades actualitzades
            this.overallProgressChartInstance = this.createChart(
                'overallProgressChart',
                'doughnut',
                this.overallProgressData,
                {
                    cutout: '80%',
                    layout: {
                        padding: 20
                    }
                }
            );
            this.productivityTrendsChartInstance = this.createChart(
                'productivityTrendsChart',
                'line',
                this.productivityTrendsData,
                {
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                drawBorder: false,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: false,
                            text: 'Tasks Completed Over Time',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            padding: {
                                bottom: 20
                            }
                        }
                    }
                }
            );
            this.deadlineAdherenceChartInstance = this.createChart(
                'deadlineAdherenceChart',
                'pie',
                this.deadlineAdherenceData,
                {
                    layout: {
                        padding: 20
                    }
                }
            );
        },
        // Funció auxiliar per obtenir les etiquetes de l'eix X segons el període seleccionat
        getLabelsForPeriod(period) {
            switch (period) {
                case 'week': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                case 'month': return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                case 'quarter': return ['Month 1', 'Month 2', 'Month 3'];
                default: return [];
            }
        },
        // Funció auxiliar per generar percentatges aleatoris que sumin 100
        generateRandomPercentages(count) {
            let nums = Array(count).fill(0).map(() => Math.random());
            const sum = nums.reduce((a, b) => a + b, 0);
            return nums.map(n => Math.round((n / sum) * 100));
        },
        // Simula la funció d'exportació de l'informe
        simulateExport() {
            console.log("Simulant exportació de l'informe...");
            alert("Funció fora dels escensaris de ús");
        },
        // Simula l'ajust de les recomanacions d'AI
        simulateAdjustRecommendations() {
            console.log("Simulant ajust de recomanacions...");
            alert("Funció fora dels escensaris de ús");
        }
    },
    mounted() {
        console.log('Component Progress Report muntat.');
        // Assegura't que Chart.js s'ha carregat abans de crear les gràfiques
        if (typeof Chart === 'undefined') {
            console.error("Chart.js no carregat. Inclou-lo a index.html.");
            return;
        }
        // Utilitza nextTick per assegurar-se que els elements canvas estan disponibles al DOM
        this.$nextTick(() => {
            this.updateCharts(); // Crea les gràfiques inicials
        });
    },
    beforeUnmount() {
        try {
            if (typeof Chart !== 'undefined') {
                const chartIds = ['overallProgressChart', 'productivityTrendsChart', 'deadlineAdherenceChart'];
                
                chartIds.forEach(id => {
                    const chartInstance = Chart.getChart(document.getElementById(id));
                    if (chartInstance) {
                        chartInstance.destroy();
                        console.log(`Chart ${id} safely destroyed`);
                    }
                });
            }
            
            this.overallProgressChartInstance = null;
            this.productivityTrendsChartInstance = null;
            this.deadlineAdherenceChartInstance = null;
            
            console.log('Component Progress Report desmuntat, gràfiques destruïdes.');
        } catch (error) {
            console.warn('Error during chart cleanup:', error);
        }
    }
};
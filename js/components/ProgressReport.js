// js/components/ProgressReport.js

const ProgressReport = {
    template: `
        <div class="progress-report-view container">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Progress & Evaluation</h2>
                <button class="btn btn-success" @click="simulateExport">
                    <i class="bi bi-download me-2"></i> Export Report
                </button>
            </div>
            
            <p class="lead text-muted mb-4">Track your productivity, analyze performance, and identify opportunities for improvement.</p>

            <!-- Filters -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-header bg-primary text-white">
                    <i class="bi bi-funnel me-2"></i> Filter Options
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-5">
                            <label for="progressScope" class="form-label fw-medium">Select Scope</label>
                            <select id="progressScope" class="form-select" v-model="selectedScope" @change="updateCharts">
                                <option value="personal">Personal</option>
                                <option value="project_alpha">Project Alpha (Team)</option>
                                <!-- Add more projects/teams dynamically -->
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

            <!-- Dashboard View -->
            <div class="row g-4">
                <!-- Overall Progress Chart -->
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                            <h5 class="m-0">Overall Progress</h5>
                            <span class="badge bg-white text-info">{{ overallProgressData.datasets[0].data[0] }}%</span>
                        </div>
                        <div class="card-body d-flex justify-content-center align-items-center">
                            <canvas id="overallProgressChart"></canvas>
                        </div>
                        <div class="card-footer text-center text-muted">
                            <div class="progress" style="height: 5px;">
                                <div class="progress-bar bg-info" role="progressbar" 
                                     :style="{ width: overallProgressData.datasets[0].data[0] + '%' }" 
                                     :aria-valuenow="overallProgressData.datasets[0].data[0]" 
                                     aria-valuemin="0" aria-valuemax="100">
                                </div>
                            </div>
                            <div class="mt-2">{{ overallProgressData.datasets[0].data[0] }}% Complete / {{ overallProgressData.datasets[0].data[1] }}% Remaining</div>
                        </div>
                    </div>
                </div>

                <!-- Productivity Trends Chart -->
                <div class="col-md-8">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-primary text-white">
                            <i class="bi bi-bar-chart-line me-2"></i> Productivity Trends
                        </div>
                        <div class="card-body">
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

                <!-- Deadline Adherence -->
                <div class="col-md-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-success text-white">
                            <i class="bi bi-calendar-check me-2"></i> Deadline Adherence
                        </div>
                        <div class="card-body d-flex justify-content-center align-items-center">
                            <canvas id="deadlineAdherenceChart"></canvas>
                        </div>
                        <div class="card-footer">
                            <div class="d-flex justify-content-center gap-4 text-center">
                                <div>
                                    <div class="text-success fw-bold">{{ deadlineAdherenceData.datasets[0].data[1] }}%</div>
                                    <div class="text-muted small">Early</div>
                                </div>
                                <div>
                                    <div class="text-primary fw-bold">{{ deadlineAdherenceData.datasets[0].data[0] }}%</div>
                                    <div class="text-muted small">On Time</div>
                                </div>
                                <div>
                                    <div class="text-danger fw-bold">{{ deadlineAdherenceData.datasets[0].data[2] }}%</div>
                                    <div class="text-muted small">Late</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Analysis & Recommendations -->
                <div class="col-md-8">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-header bg-primary-light text-dark">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="m-0"><i class="bi bi-magic me-2"></i> Smart Analysis & Recommendations</h5>
                                <button class="btn btn-sm btn-outline-primary" @click="simulateAdjustRecommendations">
                                    <i class="bi bi-sliders me-1"></i> Adjust
                                </button>
                            </div>
                        </div>
                        <div class="card-body p-0">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex py-3">
                                    <div class="flex-shrink-0 me-3">
                                        <div class="insight-icon bg-warning text-dark rounded p-2">
                                            <i class="bi bi-lightbulb"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Productivity Pattern Detected</h6>
                                        <p class="mb-0">You seem most productive on Tuesday mornings based on recent task completions.</p>
                                    </div>
                                </li>
                                <li class="list-group-item d-flex py-3">
                                    <div class="flex-shrink-0 me-3">
                                        <div class="insight-icon bg-danger text-white rounded p-2">
                                            <i class="bi bi-exclamation-triangle"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Risk Alert</h6>
                                        <p class="mb-0">Project Alpha is potentially at risk due to 3 overdue 'Urgent' tasks.</p>
                                    </div>
                                </li>
                                <li class="list-group-item d-flex py-3">
                                    <div class="flex-shrink-0 me-3">
                                        <div class="insight-icon bg-success text-white rounded p-2">
                                            <i class="bi bi-check2-circle"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h6 class="mb-1">Efficiency Suggestion</h6>
                                        <p class="mb-0">Consider breaking down 'Develop API Endpoint' into smaller subtasks for easier tracking.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Objective Setting (Enhanced) -->
            <div class="card border-0 shadow-sm mt-5">
                <div class="card-header bg-gradient-primary-to-secondary text-white d-flex justify-content-between align-items-center">
                    <h5 class="m-0 d-flex align-items-center">
                        <i class="bi bi-bullseye me-2"></i> Objectives & Key Results
                    </h5>
                    <button class="btn btn-sm btn-light d-flex align-items-center">
                        <i class="bi bi-plus-lg me-1"></i> New Objective
                    </button>
                </div>
                <div class="card-body p-4">
                    <!-- Example Objective Card -->
                    <div class="objective-card p-4 mb-3 border rounded">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="m-0 fw-semibold">Improve Team Velocity</h6>
                            <span class="badge bg-success">On Track</span>
                        </div>
                        <p class="text-muted mb-3">Increase team productivity by 20% by end of Q2 through process optimization.</p>
                        
                        <div class="progress mb-2" style="height: 8px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: 65%" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="d-flex justify-content-between text-muted small">
                            <span>Started: Apr 1, 2025</span>
                            <span class="fw-medium">65% Complete</span>
                            <span>Due: Jun 30, 2025</span>
                        </div>
                    </div>
                    
                    <!-- Add More Objectives -->
                    <div class="text-center py-4 border border-dashed rounded mt-3">
                        <i class="bi bi-plus-circle text-primary fs-4 mb-2"></i>
                        <p class="text-muted mb-0">Define SMART objectives and link them to tasks/projects</p>
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            selectedScope: 'personal',
            selectedPeriod: 'month',
            // Chart instances
            overallProgressChartInstance: null,
            productivityTrendsChartInstance: null,
            deadlineAdherenceChartInstance: null,
            // Sample data (replace with actual computed data)
            overallProgressData: {
                labels: ['Completed', 'Pending/Overdue'],
                datasets: [{
                    data: [67, 33], // Example: 67% completed
                    backgroundColor: ['#4cc9f0', '#d3d3d3'],
                    borderColor: ['#4cc9f0', '#d3d3d3'],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            },
            productivityTrendsData: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], // Example for 'month'
                datasets: [{
                    label: 'Tasks Completed',
                    data: [12, 19, 15, 22], // Example data
                    fill: {
                        target: 'origin',
                        above: 'rgba(67, 97, 238, 0.1)'
                    },
                    borderColor: '#4361ee',
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#4361ee',
                    pointRadius: 4
                }]
            },
            deadlineAdherenceData: {
                labels: ['On Time', 'Early', 'Late'],
                datasets: [{
                    data: [70, 10, 20], // Example: 70% on time, 10% early, 20% late
                    backgroundColor: ['#4361ee', '#4ade80', '#f43f5e'],
                    borderWidth: 1,
                    hoverOffset: 4
                }]
            }
        };
    },
    methods: {
        createChart(chartId, type, data, options = {}) {
            const ctx = document.getElementById(chartId);
            if (!ctx) {
                console.error(`Canvas element with id "${chartId}" not found.`);
                return null;
            }
            // Destroy previous chart instance if it exists
            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                existingChart.destroy();
            }

            try {
                return new Chart(ctx, {
                    type: type,
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: type !== 'doughnut' && type !== 'pie' ? true : false,
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 6
                                }
                            },
                            tooltip: {
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
                                        if (type === 'pie' || type === 'doughnut') {
                                            return ` ${context.label}: ${context.raw}%`;
                                        }
                                        return ` ${context.dataset.label}: ${context.raw}`;
                                    }
                                }
                            }
                        },
                        ...options // Merge custom options
                    }
                });
            } catch (error) {
                console.error(`Error creating chart "${chartId}":`, error);
                return null;
            }
        },
        updateCharts() {
            console.log(`Updating charts for scope: ${this.selectedScope}, period: ${this.selectedPeriod}`);
            // --- Simulate fetching new data based on filters ---
            // In a real app, you'd fetch data and update the 'data' properties below
            // Example: Randomize data slightly for demonstration
            this.overallProgressData.datasets[0].data = [Math.floor(Math.random() * 50) + 30, 100 - (Math.floor(Math.random() * 50) + 30)];
            this.productivityTrendsData.labels = this.getLabelsForPeriod(this.selectedPeriod);
            this.productivityTrendsData.datasets[0].data = this.productivityTrendsData.labels.map(() => Math.floor(Math.random() * 15) + 5);
            this.deadlineAdherenceData.datasets[0].data = this.generateRandomPercentages(3);

            // --- Re-create charts with updated data ---
            this.overallProgressChartInstance = this.createChart(
                'overallProgressChart',
                'doughnut',
                this.overallProgressData,
                {
                    cutout: '75%',
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
                                drawBorder: false
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
        getLabelsForPeriod(period) {
            switch (period) {
                case 'week': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                case 'month': return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
                case 'quarter': return ['Month 1', 'Month 2', 'Month 3'];
                default: return [];
            }
        },
        generateRandomPercentages(count) {
            let nums = Array(count).fill(0).map(() => Math.random());
            const sum = nums.reduce((a, b) => a + b, 0);
            return nums.map(n => Math.round((n / sum) * 100));
        },
        simulateExport() {
            console.log("Simulating report export...");
            alert("Report export initiated. Choose format (PDF/CSV) and scope in the export dialog.");
        },
        simulateAdjustRecommendations() {
            console.log("Simulating adjustment of recommendations...");
            alert("Opening AI recommendation settings. You can configure which types of insights to prioritize.");
        }
    },
    mounted() {
        console.log('Progress Report component mounted.');
        // Ensure Chart.js is loaded before creating charts
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not loaded. Please include it in index.html.");
            return;
        }
        // Use nextTick to ensure the canvas elements are rendered in the DOM
        this.$nextTick(() => {
            this.updateCharts(); // Initial chart creation
        });
    },
    beforeUnmount() {
        // Destroy chart instances when component is unmounted to prevent memory leaks
        this.overallProgressChartInstance?.destroy();
        this.productivityTrendsChartInstance?.destroy();
        this.deadlineAdherenceChartInstance?.destroy();
        console.log('Progress Report component unmounted, charts destroyed.');
    }
};

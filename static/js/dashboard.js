// Dashboard Charts and Analytics
class Dashboard {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#007bff',
            success: '#28a745',
            info: '#17a2b8',
            warning: '#ffc107',
            danger: '#dc3545',
            secondary: '#6c757d'
        };
        this.chartColors = [
            '#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8'
        ];
    }
    
    initializeCharts(data) {
        this.createClassDistributionChart(data.classDistribution);
        this.createScoreDistributionChart(data.scoreDistribution);
        this.createMonthlyTrendChart(data.monthlyRegistrations);
        this.bindEvents();
    }
    
    createClassDistributionChart(data) {
        const canvas = document.getElementById('classChart');
        if (!canvas || !data.labels.length) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.classChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: this.chartColors.slice(0, data.labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#dee2e6',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}명 (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: 1500
                }
            }
        });
    }
    
    createScoreDistributionChart(data) {
        const canvas = document.getElementById('scoreChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.scoreChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '학습자 수',
                    data: data.data,
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',   // 80점 이상
                        'rgba(23, 162, 184, 0.8)',  // 60-79점
                        'rgba(255, 193, 7, 0.8)',   // 40-59점
                        'rgba(220, 53, 69, 0.8)'    // 40점 미만
                    ],
                    borderColor: [
                        '#28a745',
                        '#17a2b8',
                        '#ffc107',
                        '#dc3545'
                    ],
                    borderWidth: 2,
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#dee2e6',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y}명`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#6c757d'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    createMonthlyTrendChart(data) {
        const canvas = document.getElementById('trendChart');
        if (!canvas || !data.labels.length) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '월별 등록자 수',
                    data: data.data,
                    borderColor: this.colors.info,
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.info,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 12
                            },
                            color: '#6c757d'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#dee2e6',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `등록자: ${context.parsed.y}명`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
    
    bindEvents() {
        // Period selector for trend chart
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.updateTrendPeriod(period);
                
                // Update active button
                document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Refresh button
        const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', this.refreshData.bind(this));
        }
    }
    
    async updateTrendPeriod(period) {
        try {
            const response = await fetch(`/api/dashboard_data?period=${period}`);
            const data = await response.json();
            
            if (this.charts.trendChart && data.monthly_registrations) {
                this.charts.trendChart.data.labels = data.monthly_registrations.labels;
                this.charts.trendChart.data.datasets[0].data = data.monthly_registrations.data;
                this.charts.trendChart.update('active');
            }
        } catch (error) {
            console.error('Error updating trend data:', error);
        }
    }
    
    async refreshData() {
        try {
            // Add loading state
            this.setLoadingState(true);
            
            const response = await fetch('/api/dashboard_data');
            const data = await response.json();
            
            // Update all charts
            this.updateAllCharts(data);
            
            // Update statistics
            this.updateStatistics(data);
            
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            this.showError('데이터를 새로고침하는 중 오류가 발생했습니다.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    updateAllCharts(data) {
        // Update class distribution chart
        if (this.charts.classChart && data.class_distribution) {
            this.charts.classChart.data.labels = data.class_distribution.labels;
            this.charts.classChart.data.datasets[0].data = data.class_distribution.data;
            this.charts.classChart.update('active');
        }
        
        // Update score distribution chart
        if (this.charts.scoreChart && data.score_distribution) {
            this.charts.scoreChart.data.datasets[0].data = data.score_distribution.data;
            this.charts.scoreChart.update('active');
        }
        
        // Update trend chart
        if (this.charts.trendChart && data.monthly_registrations) {
            this.charts.trendChart.data.labels = data.monthly_registrations.labels;
            this.charts.trendChart.data.datasets[0].data = data.monthly_registrations.data;
            this.charts.trendChart.update('active');
        }
    }
    
    updateStatistics(data) {
        // Update stat numbers with animation
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach((stat, index) => {
            const newValue = this.getStatValue(data, index);
            if (newValue !== undefined) {
                this.animateNumber(stat, parseInt(stat.textContent), newValue);
            }
        });
    }
    
    getStatValue(data, index) {
        // Map index to data values - adjust as needed
        switch(index) {
            case 0: return data.total_learners || 0;
            case 1: return data.completed_tests || 0;
            case 2: return data.class_count || 0;
            case 3: return data.high_performers || 0;
            default: return undefined;
        }
    }
    
    animateNumber(element, start, end) {
        const duration = 1000;
        const startTime = Date.now();
        
        function update() {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    setLoadingState(loading) {
        const refreshBtn = document.querySelector('[onclick="refreshDashboard()"]');
        if (refreshBtn) {
            if (loading) {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i data-feather="loader" class="me-2"></i>새로고침 중...';
                refreshBtn.querySelector('i').style.animation = 'spin 1s linear infinite';
            } else {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i data-feather="refresh-cw" class="me-2"></i>새로고침';
            }
            feather.replace();
        }
    }
    
    showError(message) {
        // Create error alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            <i data-feather="alert-circle" class="me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at top of main content
        const main = document.querySelector('main');
        main.insertBefore(alert, main.firstChild);
        
        feather.replace();
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    exportChart(chartId, filename) {
        const chart = this.charts[chartId];
        if (!chart) return;
        
        const canvas = chart.canvas;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename || `${chartId}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    printCharts() {
        window.print();
    }
    
    // Responsive chart handling
    handleResize() {
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }
}

// Global dashboard instance
let dashboard;

// Initialize dashboard
function initializeDashboard(data) {
    dashboard = new Dashboard();
    dashboard.initializeCharts(data);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (dashboard) {
            dashboard.handleResize();
        }
    });
}

// Global export function
function exportChart(chartId) {
    if (dashboard) {
        dashboard.exportChart(chartId);
    }
}

// Auto-refresh every 5 minutes
setInterval(() => {
    if (dashboard && document.visibilityState === 'visible') {
        dashboard.refreshData();
    }
}, 5 * 60 * 1000);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        switch(e.key) {
            case 'r':
            case 'R':
                e.preventDefault();
                if (dashboard) {
                    dashboard.refreshData();
                }
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                if (dashboard) {
                    dashboard.printCharts();
                }
                break;
        }
    }
});

// Add CSS animations
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .chart-container {
        position: relative;
        overflow: hidden;
    }
    
    .chart-container.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 1000;
    }
    
    .stat-number {
        transition: all 0.3s ease;
    }
    
    .stat-icon {
        transition: transform 0.3s ease;
    }
    
    .card:hover .stat-icon {
        transform: scale(1.1);
    }
`;

document.head.appendChild(dashboardStyle);

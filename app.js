document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('dashboard_data.json');
        const data = await response.json();

        initDashboard(data);
    } catch (error) {
        console.error("Error loading JSON:", error);
        document.getElementById('landscape-body').innerHTML = '<tr><td colspan="4">Error reading dashboard_data.json locally. Ensure you use a web server.</td></tr>';
    }
});

let currentPage = 1;
const rowsPerPage = 15;
let filteredPapers = [];

function initDashboard(data) {
    document.getElementById('total-papers').textContent = data.analytics.total_papers;

    // Setup Prior Approach Landscape mapping
    populateLandscape(data.analytics.approaches);

    // Filter out "Other/Epidemiological" for strictly ML/Forecasting metrics based on the slide
    const strictApproachesCount = data.analytics.total_papers - data.analytics.approaches['Other/Epidemiological'];
    document.getElementById('total-approaches-count').textContent = `(${strictApproachesCount} Forecasting Models mapped)`;

    // Render Charts
    renderCharts(data.analytics);

    // Render Data Table
    filteredPapers = data.papers;
    renderTable();
    setupFilters(data.papers);
}

function populateLandscape(approaches) {
    const tbody = document.getElementById('landscape-body');
    const landscapes = [
        {
            name: "Classical ML",
            examples: "Ridge, RF, XGBoost, SVM",
            desc: "Deterministic regression on lagged meteorological features",
            failsAt: "Both",
            failsClass: "fails-both",
            reason: "No temporal structure, no distributional output",
            reasonClass: "fails-reason",
            count: approaches['Classical ML'] || 0
        },
        {
            name: "Deep Sequence",
            examples: "LSTM, GRU, TCN, Attention, CNN",
            desc: "Learns local temporal dependencies from historical series",
            failsAt: "Barrier 1",
            failsClass: "fails-b1",
            reason: "Overfits transient dynamics, no distributional output",
            reasonClass: "fails-reason reason-teal",
            count: approaches['Deep Sequence'] || 0
        },
        {
            name: "Climate-Augmented",
            examples: "EWS with covariates",
            desc: "Appends meteorological variables to forecaster inputs",
            failsAt: "Barrier 2",
            failsClass: "fails-b2",
            reason: "Heuristic injection, unstable covariate relationships",
            reasonClass: "fails-reason reason-navy",
            count: approaches['Climate-Augmented'] || 0
        },
        {
            name: "Transfer Learning",
            examples: "Domain adaptation",
            desc: "Adaptation in medical imaging and NLP domains",
            failsAt: "Both",
            failsClass: "fails-both",
            reason: "Virtually unexplored for climate-disease forecasting",
            reasonClass: "fails-reason",
            count: approaches['Transfer Learning'] || 0
        }
    ];

    let html = '';
    landscapes.forEach(l => {
        html += `
            <tr>
                <td>
                    <h5>${l.name}</h5>
                    <em>${l.examples}</em>
                </td>
                <td class="approach-desc">${l.desc}</td>
                <td>
                    <span class="fails-badge ${l.failsClass}">${l.failsAt}</span>
                    <span class="${l.reasonClass}">${l.reason}</span>
                </td>
                <td style="text-align:center;">
                    <span class="badge-count">${l.count}</span>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function renderCharts(analytics) {
    // Colors
    const colors = ['#0A1C3E', '#1A8C84', '#C52233', '#94A3B8', '#475569'];

    // Approach Chart (Excluding 'Other' to focus on Modeling context)
    const ctxApp = document.getElementById('approachChart').getContext('2d');
    new Chart(ctxApp, {
        type: 'doughnut',
        data: {
            labels: ['Classical ML', 'Deep Sequence', 'Climate-Augmented', 'Transfer Learning'],
            datasets: [{
                data: [
                    analytics.approaches['Classical ML'],
                    analytics.approaches['Deep Sequence'],
                    analytics.approaches['Climate-Augmented'],
                    analytics.approaches['Transfer Learning']
                ],
                backgroundColor: ['#475569', '#1A8C84', '#0A1C3E', '#F59E0B'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Grade Chart
    const ctxGrade = document.getElementById('gradeChart').getContext('2d');
    new Chart(ctxGrade, {
        type: 'bar',
        data: {
            labels: ['High (A)', 'Moderate (B)', 'Low (C)', 'Very Low (D)'],
            datasets: [{
                label: 'Papers Count',
                data: [
                    analytics.grades['High'],
                    analytics.grades['Moderate'],
                    analytics.grades['Low'],
                    analytics.grades['Very Low']
                ],
                backgroundColor: ['#10B981', '#F59E0B', '#F97316', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
    });

    // Barrier Map Chart
    const ctxBar = document.getElementById('barrierChart').getContext('2d');
    new Chart(ctxBar, {
        type: 'polarArea',
        data: {
            labels: ['Barrier 1 (Non-Stationary)', 'Barrier 2 (Ill-Posed)', 'Fails Both'],
            datasets: [{
                data: [
                    analytics.barriers['Barrier 1'],
                    analytics.barriers['Barrier 2'],
                    analytics.barriers['Both']
                ],
                backgroundColor: ['rgba(26, 140, 132, 0.7)', 'rgba(10, 28, 62, 0.7)', 'rgba(197, 34, 51, 0.7)'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

function renderTable() {
    const tbody = document.getElementById('evidence-table-body');
    const start = (currentPage - 1) * rowsPerPage;
    const paginated = filteredPapers.slice(start, start + rowsPerPage);

    let html = '';
    paginated.forEach(p => {
        let gradeClass = '';
        if (p.grade === 'High') gradeClass = 'grade-high';
        if (p.grade === 'Moderate') gradeClass = 'grade-moderate';
        if (p.grade === 'Low') gradeClass = 'grade-low';
        if (p.grade === 'Very Low') gradeClass = 'grade-very-low';

        html += `
            <tr>
                <td>${p.year}</td>
                <td style="font-size:0.8rem;">${p.authors}</td>
                <td>
                    <strong>${p.title}</strong>
                    <div style="font-size:0.75rem; color:#64748B; margin-top:4px;">${p.summary}</div>
                </td>
                <td><span class="badge-count" style="background:${p.approach === 'Deep Sequence' ? '#1A8C84' : '#475569'}">${p.approach}</span></td>
                <td><span class="grade-badge ${gradeClass}">${p.grade}</span></td>
            </tr>
        `;
    });

    if (paginated.length === 0) {
        html = '<tr><td colspan="5" style="text-align:center;">No papers found for the selected criteria.</td></tr>';
    }

    tbody.innerHTML = html;
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredPapers.length / rowsPerPage);
    const container = document.getElementById('pagination-controls');

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

window.goToPage = function (page) {
    currentPage = page;
    renderTable();
}

function setupFilters(allPapers) {
    const searchInput = document.getElementById('searchInput');
    const gradeFilter = document.getElementById('gradeFilter');

    function filterData() {
        const text = searchInput.value.toLowerCase();
        const grade = gradeFilter.value;

        filteredPapers = allPapers.filter(p => {
            const matchText = p.title.toLowerCase().includes(text) ||
                p.authors.toLowerCase().includes(text) ||
                p.approach.toLowerCase().includes(text) ||
                p.summary.toLowerCase().includes(text);
            const matchGrade = grade === 'All' || p.grade === grade;
            return matchText && matchGrade;
        });

        currentPage = 1;
        renderTable();
    }

    searchInput.addEventListener('input', filterData);
    gradeFilter.addEventListener('change', filterData);
}

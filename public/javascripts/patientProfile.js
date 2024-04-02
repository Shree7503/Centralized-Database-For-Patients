const data = {
    illnesses: [3, 4, 2, 5, 3, 6, 4, 5, 3, 4, 2, 3], // Replace with real data
    hospitalizations: [1, 2, 1, 3, 2, 4, 2, 3, 1, 2, 1, 2], // Replace with real data
    moneySpent: [15000, 25000, 20000, 35000, 30000, 45000, 35000, 40000, 25000, 30000, 20000, 25000], // Increased monetary values
    doctorVisits: [10, 7, 5, 3, 5, 8, 6, 9, 7, 4, 6, 8], // Corrected doctor visit data
    insuranceCovered: [12000, 16000, 13000, 20000, 15000, 22000, 18000, 19000, 14000, 15000, 12000, 14000] // Increased insurance coverage
};

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const doctorNames = ['Dr. Smith', 'Dr. Brown', 'Dr. Patil', 'Dr. Lee', 'Dr. Chen', 'Dr. Kim', 'Dr. Rodriguez', 'Dr. Martinez','Dr.Markhande','Dr.Gaikwad','Dr.Shaikh','Dr.Patel'];
const hospitalNames = ['Mercy Hospital', 'City Hospital', 'Grace Hospital', 'Memorial Hospital', 'Unity Hospital', 'Sunrise Hospital', 'Evergreen Hospital', 'Riverside Hospital', 'Oakwood Hospital', 'Parkview Hospital', 'Pinecrest Hospital', 'Greenfield Hospital'];

// Function to render charts
const renderChart = (canvasId, label, data, names) => {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data.map((value, index) => ({ x: labels[index], y: value, name: names ? names[index] : null })),
                fill: false,
                borderColor: 'blue',
                tension: 0.4
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        title: () => 'View Full Graph',
                        label: (context) => {
                            const value = context.parsed.y || 0;
                            return names ? `${names[context.dataIndex]}: ${value}` : `${value}`;
                        }
                    }
                }
            }
        }
    });

    ctx.canvas.addEventListener('click', function(evt) {
        const chartPopup = document.getElementById('chartPopup');
        const popupCanvas = document.getElementById('popupCanvas');
        const popupInfo = document.getElementById('popupInfo');
        const popupCtx = popupCanvas.getContext('2d');

        chartPopup.style.display = 'block';
        popupCanvas.width = window.innerWidth;
        popupCanvas.height = window.innerHeight;
        popupCtx.clearRect(0, 0, popupCanvas.width, popupCanvas.height);
        popupCtx.drawImage(ctx.canvas, 0, 0, popupCanvas.width, popupCanvas.height);
        const element = chart.getElementAtEvent(evt)[0];
        if (element) {
            const bounds = element.getBoundingClientRect();
            popupInfo.style.display = 'block';
            popupInfo.style.top = bounds.top + window.scrollY - popupInfo.offsetHeight + 'px';
            popupInfo.style.left = bounds.left + window.scrollX + 'px';
            popupInfo.textContent = `${element.dataset.data[element.dataIndex].name || ''}: ${element.parsed.y}`;
        } else {
            popupInfo.style.display = 'none';
        }
    });
};

// Function to close the full graph view
const closeGraphPopup = () => {
    const chartPopup = document.getElementById('chartPopup');
    chartPopup.style.display = 'none';
};

// Function to render tables
const renderTable = (tableId, label, data, names) => {
    const table = document.getElementById(tableId);
    table.innerHTML = `<tr><th>Month</th><th>${label}</th></tr>`;
    for (let i = 0; i < labels.length; i++) {
        if (label === 'Doctor Visits' || label === 'Hospitalization Count') {
            table.innerHTML += `<tr><td>${labels[i]}</td><td>${names ? names[i] : ''}: ${data[i]}</td></tr>`;
        } else {
            table.innerHTML += `<tr><td>${labels[i]}</td><td>${data[i]}</td></tr>`;
        }
    }
};

// Render charts and tables
renderChart('illnessChart', 'Illness Count', data.illnesses);
renderTable('illnessTable', 'Illness Count', data.illnesses);

renderChart('hospitalizationChart', 'Hospitalization Count', data.hospitalizations, hospitalNames);
renderTable('hospitalizationTable', 'Hospitalization Count', data.hospitalizations, hospitalNames);

renderChart('moneySpentChart', 'Money Spent (in ₹)', data.moneySpent);
renderTable('moneySpentTable', 'Money Spent (in ₹)', data.moneySpent);

renderChart('doctorVisitsChart', 'Doctor Visits', data.doctorVisits, doctorNames);
renderTable('doctorVisitsTable', 'Doctor Visits', data.doctorVisits, doctorNames);

renderChart('insuranceChart', 'Insurance Covered (in ₹)', data.insuranceCovered);
renderTable('insuranceTable', 'Insurance Covered (in ₹)', data.insuranceCovered);
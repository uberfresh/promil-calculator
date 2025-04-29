let weight = document.querySelector("#weight");
let gender = document.querySelector("#gender");

let drink = document.querySelector("#drink");
let drinkName = document.querySelector("#drinkName");
let percentage = document.querySelector("#percentage");
let volume = document.querySelector("#volume");
let quantity = document.querySelector("#quantity");
let timeSince = document.querySelector("#timeSince");

let calculateBtn = document.querySelector("#calculateBtn");
let clearAllBtn = document.querySelector("#clearAllBtn");
let drinksList = document.querySelector("#drinksList");

let promilDisplay = document.querySelector("#promil-display");

// Array to store drinks and calculate promil timeline
let consumedDrinks = [];
let promilChart;

const drinkMap = {
    "beer-500": { name: "Bira 50cl", percentage: 5, volume: 500 },
    "beer-330": { name: "Bira 33cl", percentage: 5, volume: 330 },
    "raki-tek": { name: "Rakı Duble 8cl", percentage: 45, volume: 80 },
    "raki-duble": { name: "Rakı Tek 4cl", percentage: 45, volume: 40 },
    "wine": { name: "Şarap Kadeh 15cl", percentage: 12, volume: 150 },
    "vodka": { name: "Votka Shot 5cl", percentage: 40, volume: 50 },
    "custom": { name: "", percentage: "", volume: "" }
};

// Helper function to get time description
function getTimeDescription(timeSinceValue) {
    switch(timeSinceValue) {
        case "0": return "Şimdi";
        case "1": return "1 saat önce";
        case "2": return "2 saat önce";
        case "3": return "3 saat önce";
        case "4": return "4 saat önce";
        case "5": return "5 saat önce";
        case "6": return "6 saat önce";
        default: return `${timeSinceValue} saat önce`;
    }
}

function animatePop(element) {
    element.classList.remove("pop-effect"); // Reset animation
    void element.offsetWidth; // Trigger reflow
    element.classList.add("pop-effect");
}

function setDrinkAttributes() {
    drink.addEventListener("change", () => {
        const selectedValue = drink.value;
        const drinkInfo = drinkMap[selectedValue];

        if (drinkInfo) {
            drinkName.value = drinkInfo.name;
            percentage.value = drinkInfo.percentage;
            volume.value = drinkInfo.volume;

            // Animate fields
            animatePop(drinkName);
            animatePop(percentage);
            animatePop(volume);
        } else {
            drinkName.value = "";
            percentage.value = "";
            volume.value = "";
        }
    });
}

// Initialize the chart with optimized timeline
function initializeChart() {
    const ctx = document.getElementById('promilChart').getContext('2d');
    
    promilChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Promil Seviyesi',
                    data: [],
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: function(context) {
                        const value = context.raw;
                        return value >= 0.5 ? '#dc3545' : '#28a745';
                    }
                },
                {
                    label: 'Şu an',
                    data: [], // Will be set to have one data point at current time
                    pointStyle: 'circle',
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    pointBackgroundColor: '#343a40',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    borderWidth: 0,
                    tension: 0,
                    fill: false,
                    showLine: false
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Promil'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Saat'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            // Format the time label
                            const now = new Date();
                            const date = new Date();
                            date.setHours(now.getHours() + parseInt(value));
                            return date.getHours() + ':00';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Promil: ${context.parsed.y.toFixed(2)}`;
                            } else {
                                return 'Şu anki zaman';
                            }
                        },
                        title: function(context) {
                            const now = new Date();
                            const date = new Date();
                            date.setHours(now.getHours() + parseInt(context[0].label));
                            return `Saat: ${date.getHours()}:00`;
                        }
                    }
                }
            }
        }
    });
    
    // Add threshold line after chart is initialized
    addThresholdLine();
}

// Add a threshold line at 0.5 promil
function addThresholdLine() {
    // Create a horizontal line at the 0.5 promil mark
    const chartContainer = document.getElementById('promilChart').parentNode;
    const thresholdContainer = document.createElement('div');
    thresholdContainer.id = 'threshold-container';
    thresholdContainer.style.position = 'relative';
    thresholdContainer.style.marginTop = '-150px'; // Adjust based on chart height
    thresholdContainer.style.pointerEvents = 'none'; // Don't interfere with chart
    thresholdContainer.style.zIndex = '1';
    
    const thresholdLine = document.createElement('div');
    thresholdLine.id = 'threshold-line';
    thresholdLine.style.position = 'absolute';
    thresholdLine.style.width = '100%';
    thresholdLine.style.height = '1px';
    thresholdLine.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    thresholdLine.style.borderBottom = '1px dashed rgba(0, 0, 0, 0.5)';
    thresholdLine.style.top = '75px'; // Position at 0.5 mark (adjust as needed)
    
    const thresholdLabel = document.createElement('div');
    thresholdLabel.id = 'threshold-label';
    thresholdLabel.style.position = 'absolute';
    thresholdLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    thresholdLabel.style.color = 'white';
    thresholdLabel.style.padding = '2px 6px';
    thresholdLabel.style.borderRadius = '3px';
    thresholdLabel.style.fontSize = '10px';
    thresholdLabel.style.top = '72px'; // Align with line
    thresholdLabel.style.left = '10px';
    thresholdLabel.textContent = 'Yasal Sınır (0.50‰)';
    
    thresholdContainer.appendChild(thresholdLine);
    thresholdContainer.appendChild(thresholdLabel);
    
    // Remove any existing threshold container
    const existingContainer = document.getElementById('threshold-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    chartContainer.appendChild(thresholdContainer);
}

// Calculate promil over optimized time range and update chart
function updatePromilChart() {
    if (consumedDrinks.length === 0) {
        // Clear chart if no drinks
        promilChart.data.labels = [];
        promilChart.data.datasets[0].data = [];
        promilChart.data.datasets[1].data = [];
        promilChart.update();
        
        promilDisplay.innerHTML = "0.00";
        promilDisplay.classList.remove('danger');
        promilDisplay.classList.add('safe');
        return;
    }
    
    const userWeight = parseFloat(weight.value);
    const userGender = gender.value;
    const r = (userGender === "male") ? 0.68 : 0.55;
    const beta = 0.15; // Per hour elimination rate
    
    // Find the earliest drink time to start the chart
    let earliestDrinkTime = Math.min(...consumedDrinks.map(drink => parseFloat(drink.timeSince)));
    
    // Calculate max promil at time zero
    let maxPromilAtZero = 0;
    consumedDrinks.forEach(drink => {
        const hoursSinceDrink = parseFloat(drink.timeSince);
        const metabolized = beta * hoursSinceDrink;
        const remainingPromil = Math.max(0, drink.rawPromil - metabolized);
        maxPromilAtZero += remainingPromil;
    });
    
    // Calculate how many hours until promil goes to zero
    // Formula: time = promil / metabolism rate
    const hoursUntilZero = Math.ceil(maxPromilAtZero / beta) + 1;
    
    // Create timeline from earliest drink to when promil is expected to reach zero
    const hourLabels = [];
    const promilData = [];
    const currentTimeData = [];
    
    // Start 1 hour before the earliest drink for context
    const startHour = Math.max(-24, -Math.ceil(earliestDrinkTime) - 1);
    const endHour = Math.min(24, hoursUntilZero);
    
    for (let hour = startHour; hour <= endHour; hour++) {
        let totalPromil = 0;
        
        // Calculate contribution of each drink at this hour
        consumedDrinks.forEach(drink => {
            const hoursSinceDrink = parseFloat(drink.timeSince) + hour;
            if (hoursSinceDrink >= 0) { // Only count if drink was consumed by this time
                const metabolized = beta * hoursSinceDrink;
                const remainingPromil = Math.max(0, drink.rawPromil - metabolized);
                totalPromil += remainingPromil;
            }
        });
        
        hourLabels.push(hour);
        promilData.push(totalPromil);
        
        // Add marker for current time (hour = 0)
        if (hour === 0) {
            currentTimeData.push(totalPromil);
        } else {
            currentTimeData.push(null);
        }
    }
    
    // Update chart
    promilChart.data.labels = hourLabels;
    promilChart.data.datasets[0].data = promilData;
    promilChart.data.datasets[1].data = currentTimeData;
    
    // Update line and background colors based on current promil value
    const currentPromil = promilData[hourLabels.indexOf(0)] || 0;
    
    if (currentPromil >= 0.5) {
        promilChart.data.datasets[0].borderColor = '#dc3545';
        promilChart.data.datasets[0].backgroundColor = 'rgba(220, 53, 69, 0.2)';
    } else {
        promilChart.data.datasets[0].borderColor = '#28a745';
        promilChart.data.datasets[0].backgroundColor = 'rgba(40, 167, 69, 0.2)';
    }
    
    promilChart.update();
    
    // Update current promil display
    promilDisplay.innerHTML = currentPromil.toFixed(2);
    
    // Update promil display color based on value
    promilDisplay.classList.remove('safe', 'danger');
    
    if (currentPromil < 0.5) {
        promilDisplay.classList.add('safe');
    } else {
        promilDisplay.classList.add('danger');
    }
    
    // Reposition threshold line if needed
    setTimeout(adjustThresholdLine, 100);
}


// Update the drinks list table
function updateDrinksList() {
    // Clear previous content
    drinksList.innerHTML = '';
    
    // Show "no drinks" message if empty
    if (consumedDrinks.length === 0) {
        drinksList.innerHTML = `
            <tr class="no-drinks-row">
                <td colspan="7" class="text-center">Henüz içecek eklenmedi</td>
            </tr>
        `;
        return;
    }
    
    // Add each drink to the table
    consumedDrinks.forEach((drink, index) => {
        const row = document.createElement('tr');
        row.className = 'drink-row';
        row.innerHTML = `
            <td>${drink.name}</td>
            <td>${drink.percentage}%</td>
            <td>${drink.volume} ml</td>
            <td>${drink.quantity}</td>
            <td>${getTimeDescription(drink.timeSince)}</td>
            <td>${drink.rawPromil.toFixed(2)}‰</td>
            <td>
                <button class="btn btn-sm btn-danger remove-drink" data-index="${index}">
                    <i class="bi bi-x-circle"></i> Sil
                </button>
            </td>
        `;
        drinksList.appendChild(row);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-drink').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeDrink(index);
        });
    });
}

// Remove a drink from the list
function removeDrink(index) {
    if (index >= 0 && index < consumedDrinks.length) {
        consumedDrinks.splice(index, 1);
        updateDrinksList();
        updatePromilChart();
    }
}

// Clear all drinks
function clearAllDrinks() {
    consumedDrinks = [];
    updateDrinksList();
    updatePromilChart();
}

// Add drink to the list and update chart
function addDrink() {
    const userWeight = parseFloat(weight.value);
    const userGender = gender.value;
    const drinkPercentage = parseFloat(percentage.value);
    const drinkVolume = parseFloat(volume.value);
    const drinkQuantity = parseFloat(quantity.value);
    const hoursSince = timeSince.value;
    
    // Validate inputs
    if (!userWeight || !drinkPercentage || !drinkVolume || !drinkQuantity) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }
    
    const r = (userGender === "male") ? 0.68 : 0.55;
    const ethanolDensity = 0.789;

    const gramsOfAlcohol = (drinkVolume * drinkPercentage * ethanolDensity * drinkQuantity) / 100;
    const rawPromil = gramsOfAlcohol / (r * userWeight);
    
    // Add to consumed drinks
    consumedDrinks.push({
        name: drinkName.value || "İçecek",
        percentage: drinkPercentage,
        volume: drinkVolume,
        quantity: drinkQuantity,
        timeSince: hoursSince,
        rawPromil: rawPromil
    });
    
    // Animate promil display
    animatePop(promilDisplay);
    
    // Update table and chart
    updateDrinksList();
    updatePromilChart();
    
    // Reset quantity to 1 after adding
    quantity.value = 1;
    
    // Log for debugging
    console.log({
        userWeight,
        userGender,
        drinkPercentage,
        drinkVolume,
        drinkQuantity,
        hoursSince,
        gramsOfAlcohol,
        rawPromil,
        consumedDrinks
    });
}

// Initialize event handlers
function initializeEventHandlers() {
    setDrinkAttributes();
    calculateBtn.addEventListener("click", addDrink);
    clearAllBtn.addEventListener("click", clearAllDrinks);
    
    // Update chart when weight or gender changes
    weight.addEventListener("change", updatePromilChart);
    gender.addEventListener("change", updatePromilChart);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    initializeEventHandlers();
    updateDrinksList();
    
    // Set initial drink values
    const initialDrink = drinkMap[drink.value];
    if (initialDrink) {
        drinkName.value = initialDrink.name;
        percentage.value = initialDrink.percentage;
        volume.value = initialDrink.volume;
    }
});

// Adjust threshold line position after chart redraw
function adjustThresholdLine() {
    const chart = promilChart;
    if (!chart || !chart.scales || !chart.scales.y) return;
    
    const thresholdY = chart.scales.y.getPixelForValue(0.5);
    const chartArea = chart.chartArea;
    
    const thresholdLine = document.getElementById('threshold-line');
    const thresholdLabel = document.getElementById('threshold-label');
    
    if (thresholdLine && thresholdLabel) {
        thresholdLine.style.top = `${thresholdY}px`;
        thresholdLabel.style.top = `${thresholdY - 8}px`;
    }
}
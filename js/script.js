// Currency configuration
const currencies = {
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham' },
    SAR: { symbol: '﷼', name: 'Saudi Riyal' },
    EGP: { symbol: 'E£', name: 'Egyptian Pound' },
    MAD: { symbol: 'د.م.', name: 'Moroccan Dirham' }
};

let currentCurrency = 'USD';
let financialChart, distributionChart;

// Default values
const defaults = {
    visitors: 10000,
    adSpend: 2000,
    conversionRate: 2.5,
    sellingPrice: 49.99,
    productCost: 15,
    shippingCost: 5,
    fixedCosts: 500,
    confirmationRate: 70,
    deliveryRate: 60
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    setupEventListeners();
    calculateAll();
});

function setupEventListeners() {
    // Range inputs
    document.getElementById('visitors').addEventListener('input', (e) => {
        document.getElementById('visitorsValue').textContent = parseInt(e.target.value).toLocaleString();
        calculateAll();
    });

    document.getElementById('conversionRate').addEventListener('input', (e) => {
        document.getElementById('conversionValue').textContent = e.target.value + '%';
        calculateAll();
    });

    document.getElementById('confirmationRate').addEventListener('input', (e) => {
        document.getElementById('confirmationValue').textContent = e.target.value + '%';
        calculateAll();
    });

    document.getElementById('deliveryRate').addEventListener('input', (e) => {
        document.getElementById('deliveryValue').textContent = e.target.value + '%';
        calculateAll();
    });

    // Number inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    // Currency change
    document.getElementById('currencySelect').addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        updateCurrencySymbols();
        calculateAll();
    });
}

function updateCurrencySymbols() {
    const symbol = currencies[currentCurrency].symbol;
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = symbol;
    });
    document.getElementById('adSpendSymbol').textContent = symbol;
}

function initCharts() {
    // Financial Chart
    const financialCtx = document.getElementById('financialChart').getContext('2d');
    financialChart = new Chart(financialCtx, {
        type: 'bar',
        data: {
            labels: ['Revenue', 'Costs', 'Profit'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#0ea5e9', '#ef4444', '#10b981'],
                borderRadius: {
                    topLeft: 4,
                    topRight: 4,
                    bottomLeft: 0,
                    bottomRight: 0
                },
                barThickness: 32,
                maxBarThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => formatCurrency(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11 },
                        callback: (value) => formatCurrency(value, true)
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 11 } }
                }
            }
        }
    });

    // Distribution Chart
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    distributionChart = new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Product', 'Ads', 'Shipping', 'Fixed'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#14b8a6', '#0ea5e9', '#f59e0b', '#8b5cf6'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#64748b',
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    padding: 10,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((ctx.raw / total) * 100).toFixed(1) : 0;
                            return `${ctx.label}: ${formatCurrency(ctx.raw)} (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function formatCurrency(value, compact = false) {
    const symbol = currencies[currentCurrency].symbol;
    if (compact && Math.abs(value) >= 1000) {
        return symbol + (value / 1000).toFixed(1) + 'k';
    }
    return symbol + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateAll() {
    const symbol = currencies[currentCurrency].symbol;

    // Get input values
    const visitors = parseFloat(document.getElementById('visitors').value);
    const adSpend = parseFloat(document.getElementById('adSpend').value) || 0;
    const conversionRate = parseFloat(document.getElementById('conversionRate').value) / 100;
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
    const productCost = parseFloat(document.getElementById('productCost').value) || 0;
    const shippingCost = parseFloat(document.getElementById('shippingCost').value) || 0;
    const fixedCosts = parseFloat(document.getElementById('fixedCosts').value) || 0;
    const confirmationRate = parseFloat(document.getElementById('confirmationRate').value) / 100;
    const deliveryRate = parseFloat(document.getElementById('deliveryRate').value) / 100;

    // Calculate orders
    const initialOrders = Math.floor(visitors * conversionRate);
    const confirmedOrders = Math.floor(initialOrders * confirmationRate);
    const successfulOrders = Math.floor(confirmedOrders * deliveryRate);

    // Calculate financials
    const revenue = successfulOrders * sellingPrice;
    const totalProductCost = successfulOrders * productCost;
    const totalShippingCost = successfulOrders * shippingCost;
    const totalCosts = totalProductCost + totalShippingCost + adSpend + fixedCosts;
    const netProfit = revenue - totalCosts;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const roi = adSpend > 0 ? ((netProfit / adSpend) * 100) : 0;
    const roas = adSpend > 0 ? (revenue / adSpend) : 0;
    const costPerOrder = successfulOrders > 0 ? totalCosts / successfulOrders : 0;

    // Calculate break-even
    const profitPerOrder = sellingPrice - productCost - shippingCost;
    const breakEvenSales = profitPerOrder > 0 ? Math.ceil((adSpend + fixedCosts) / profitPerOrder) : 0;
    const breakEvenRoas = profitPerOrder > 0 ? (sellingPrice / profitPerOrder) : 0;

    // Sensitivity analysis
    const newConversionRate = conversionRate + 0.005;
    const newSuccessfulOrders = Math.floor(Math.floor(Math.floor(visitors * newConversionRate) * confirmationRate) * deliveryRate);
    const newRevenue = newSuccessfulOrders * sellingPrice;
    const newTotalCosts = (newSuccessfulOrders * productCost) + (newSuccessfulOrders * shippingCost) + adSpend + fixedCosts;
    const conversionSensitivity = (newRevenue - newTotalCosts) - netProfit;

    const priceRevenue = successfulOrders * (sellingPrice * 1.1);
    const priceSensitivity = (priceRevenue - totalCosts) - netProfit;

    const costSavings = successfulOrders * (productCost * 0.05);

    // Update UI
    const profitEl = document.getElementById('netProfit');
    profitEl.textContent = formatCurrency(netProfit);
    profitEl.className = `text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`;

    document.getElementById('profitMargin').textContent = profitMargin.toFixed(1) + '%';

    const roiEl = document.getElementById('roiValue');
    roiEl.textContent = roi.toFixed(1) + '%';
    roiEl.className = `text-2xl font-bold ${roi >= 0 ? 'text-sky-600' : 'text-red-600'}`;

    document.getElementById('roasValue').textContent = roas.toFixed(2) + 'x';
    document.getElementById('successfulOrders').textContent = successfulOrders.toLocaleString();
    document.getElementById('initialOrders').textContent = initialOrders.toLocaleString();
    document.getElementById('revenueValue').textContent = formatCurrency(revenue);
    document.getElementById('costPerOrder').textContent = formatCurrency(costPerOrder);
    document.getElementById('breakEvenSales').textContent = breakEvenSales.toLocaleString();
    document.getElementById('breakEvenRoas').textContent = breakEvenRoas.toFixed(2) + 'x';
    document.getElementById('totalCostsDisplay').textContent = formatCurrency(totalCosts);

    // Sensitivity
    document.getElementById('sensitivityConversion').textContent = (conversionSensitivity >= 0 ? '+' : '') + formatCurrency(conversionSensitivity);
    document.getElementById('sensitivityPrice').textContent = (priceSensitivity >= 0 ? '+' : '') + formatCurrency(priceSensitivity);
    document.getElementById('sensitivityCost').textContent = '+' + formatCurrency(costSavings);

    // Update recommendation
    updateRecommendation(netProfit, profitMargin, roas, breakEvenSales, successfulOrders);

    // Update charts
    financialChart.data.datasets[0].data = [revenue, totalCosts, Math.max(0, netProfit)];
    financialChart.data.datasets[0].backgroundColor = ['#0ea5e9', '#ef4444', netProfit >= 0 ? '#10b981' : '#ef4444'];
    financialChart.update('none');

    distributionChart.data.datasets[0].data = [totalProductCost, adSpend, totalShippingCost, fixedCosts];
    distributionChart.update('none');
}

function updateRecommendation(profit, margin, roas, breakEven, orders) {
    let recommendation = '';

    if (profit < 0) {
        recommendation = `Your store is currently operating at a loss. You need ${breakEven} orders to break even. Consider reducing costs or increasing your selling price.`;
    } else if (margin < 10) {
        recommendation = `Your profit margin of ${margin.toFixed(1)}% is quite low. Consider negotiating better product costs or optimizing your ad spend for better ROAS.`;
    } else if (roas < 2) {
        recommendation = `Your ROAS of ${roas.toFixed(2)}x could be improved. Focus on optimizing your ad targeting and conversion rate to maximize ad efficiency.`;
    } else if (margin >= 20 && roas >= 3) {
        recommendation = `Excellent performance! With ${margin.toFixed(1)}% margin and ${roas.toFixed(2)}x ROAS, your store is highly profitable. Consider scaling your ad spend to grow further.`;
    } else {
        recommendation = `Your store is profitable with ${orders} successful orders. Keep monitoring your metrics and look for opportunities to improve conversion rates.`;
    }

    document.getElementById('recommendation').textContent = recommendation;
}

function resetCalculator() {
    document.getElementById('visitors').value = defaults.visitors;
    document.getElementById('visitorsValue').textContent = defaults.visitors.toLocaleString();

    document.getElementById('adSpend').value = defaults.adSpend;

    document.getElementById('conversionRate').value = defaults.conversionRate;
    document.getElementById('conversionValue').textContent = defaults.conversionRate + '%';

    document.getElementById('sellingPrice').value = defaults.sellingPrice;
    document.getElementById('productCost').value = defaults.productCost;
    document.getElementById('shippingCost').value = defaults.shippingCost;
    document.getElementById('fixedCosts').value = defaults.fixedCosts;

    document.getElementById('confirmationRate').value = defaults.confirmationRate;
    document.getElementById('confirmationValue').textContent = defaults.confirmationRate + '%';

    document.getElementById('deliveryRate').value = defaults.deliveryRate;
    document.getElementById('deliveryValue').textContent = defaults.deliveryRate + '%';

    document.getElementById('currencySelect').value = 'USD';
    currentCurrency = 'USD';
    updateCurrencySymbols();

    calculateAll();
}

function exportPDF() {
    window.print();
}

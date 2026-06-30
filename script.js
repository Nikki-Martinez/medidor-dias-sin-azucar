// --- LÓGICA DEL CALENDARIO Y RESTRICCIONES ---
let currentDate = new Date();
const today = new Date();
let sugarFreeDays = JSON.parse(localStorage.getItem('sugarFreeDays')) || {};

// Elementos del DOM
const monthYearTitle = document.getElementById('monthYearTitle');
const daysGrid = document.getElementById('daysGrid');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const gaugeProgress = document.getElementById('gaugeProgress');
const gaugeText = document.getElementById('gaugeText');
const streakText = document.getElementById('streakText');
const feedbackMsg = document.getElementById('feedbackMsg');
const btnExport = document.getElementById('btnExport');
const importFile = document.getElementById('importFile');
const btnInstall = document.getElementById('btnInstall');

function initApp() {
    renderCalendar();
    updateMetrics();
}

function renderCalendar() {
    daysGrid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    monthYearTitle.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Rellenar días vacíos al inicio del mes
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        daysGrid.appendChild(emptyDiv);
    }

    // Dibujar los días del mes
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(year, month, day);
        
        const isToday = dateObj.toDateString() === today.toDateString();
        const isFuture = dateObj > today;
        const isPast = dateObj < today && !isToday;

        if (sugarFreeDays[dateString]) {
            dayDiv.classList.add('sugar-free');
        } else if (isPast || isToday) {
            dayDiv.classList.add('has-sugar');
        }

        // RESTRICCIONES: Sólo hoy es editable
        if (isToday) {
            dayDiv.classList.add('today');
            dayDiv.addEventListener('click', () => toggleDay(dateString));
        } else if (isFuture) {
            dayDiv.classList.add('future');
            dayDiv.style.pointerEvents = 'none';
        } else if (isPast) {
            dayDiv.classList.add('past');
            dayDiv.title = "No puedes modificar días pasados";
        }

        daysGrid.appendChild(dayDiv);
    }
}

function toggleDay(dateString) {
    if (sugarFreeDays[dateString]) {
        delete sugarFreeDays[dateString];
    } else {
        sugarFreeDays[dateString] = true;
    }
    localStorage.setItem('sugarFreeDays', JSON.stringify(sugarFreeDays));
    renderCalendar();
    updateMetrics();
}

function updateMetrics() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    let daysPassedInMonth = totalDaysInMonth;

    if (year === today.getFullYear() && month === today.getMonth()) {
        daysPassedInMonth = today.getDate();
    } else if (new Date(year, month, 1) > today) {
        daysPassedInMonth = 0;
    }

    let cleanDaysInMonth = 0;
    for (let day = 1; day <= daysPassedInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (sugarFreeDays[dateString]) cleanDaysInMonth++;
    }

    const percentage = daysPassedInMonth > 0 ? Math.round((cleanDaysInMonth / daysPassedInMonth) * 100) : 0;
    
    const circumference = 440;
    const offset = circumference - (percentage / 100) * circumference;
    gaugeProgress.style.strokeDashoffset = offset;
    gaugeText.textContent = `${percentage}%`;

    // Mensajes de Feedback dinámicos
    if (percentage === 0) feedbackMsg.textContent = "¡Hoy es el momento perfecto para arrancar sin azúcar!";
    else if (percentage < 40) feedbackMsg.textContent = "Paso a paso. Cada día cuenta para tu meta.";
    else if (percentage < 75) feedbackMsg.textContent = "¡Buen ritmo! Se nota la disciplina.";
    else if (percentage < 100) feedbackMsg.textContent = "¡Excelente progreso! Te debes sentir increíble.";
    else feedbackMsg.textContent = "¡Mes perfecto! Eres libre del azúcar. 👑";

    // Cálculo de la racha actual hacia atrás
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
        const dateString = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (sugarFreeDays[dateString]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    streakText.textContent = `🔥 Racha actual: ${streak} días`;
}

// --- COPIAS DE SEGURIDAD (EXPORTAR) ---
btnExport.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sugarFreeDays));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sugar_free_data_${today.toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

// --- COPIAS DE SEGURIDAD (IMPORTAR) ---
importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const parsedData = JSON.parse(event.target.result);
            if (typeof parsedData === 'object' && parsedData !== null) {
                sugarFreeDays = parsedData;
                localStorage.setItem('sugarFreeDays', JSON.stringify(sugarFreeDays));
                initApp();
                alert('¡Datos importados perfectamente!');
            }
        } catch (err) {
            alert('Archivo no válido.');
        }
    };
    reader.readAsText(file);
});

// Navegación de meses
prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); initApp(); });
nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); initApp(); });

// --- CONFIGURACIÓN PWA (INSTALACIÓN MÓVIL/TABLET) ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstall.style.display = 'block'; // Muestra el botón de instalar si el sistema es compatible
});

btnInstall.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            btnInstall.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// Registra el Service Worker embebido mediante un Blob para asegurar la compatibilidad PWA
if ('serviceWorker' in navigator) {
    const swBlob = new Blob([`
        self.addEventListener('fetch', function(e) {
            // Service worker mínimo para permitir instalación PWA
        });
    `], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(swBlob);
    navigator.serviceWorker.register(swUrl).catch(() => {});
}

// Inicializar la aplicación
initApp();
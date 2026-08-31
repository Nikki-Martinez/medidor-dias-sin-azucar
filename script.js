import { supabase } from "./supabaseClient.js";


/* =========================
   ELEMENTOS DEL DOM
========================= */

const calendar =
    document.getElementById("calendar");

const monthTitle =
    document.getElementById("monthTitle");

const monthSubtitle =
    document.getElementById("monthSubtitle");

const prevMonthBtn =
    document.getElementById("prevMonth");

const nextMonthBtn =
    document.getElementById("nextMonth");

const modal =
    document.getElementById("modal");

const closeModalBtn =
    document.getElementById("closeModal");

const modalDate =
    document.getElementById("modalDate");

const successBtn =
    document.getElementById("successBtn");

const failedBtn =
    document.getElementById("failedBtn");

const currentStreakElement =
    document.getElementById("currentStreak");

const bestStreakElement =
    document.getElementById("bestStreak");

const successDaysElement =
    document.getElementById("successDays");

const failedDaysElement =
    document.getElementById("failedDays");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const totalRegistered =
    document.getElementById("totalRegistered");

const successPercentage =
    document.getElementById("successPercentage");

const motivation =
    document.getElementById("motivation");

const achievementsContainer =
    document.getElementById("achievements");

const themeBtn =
    document.getElementById("themeBtn");

const toast =
    document.getElementById("toast");


/* =========================
   ESTADO GLOBAL
========================= */

let currentUser = null;

let records = {};

let selectedDate = null;


function getToday() {

    const date =
        new Date();

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}


let today =
    getToday();

let currentYear =
    today.getFullYear();

let currentMonth =
    today.getMonth();


/* =========================
   DATOS FIJOS
========================= */

const MONTHS = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
];


const motivations = [
    "No necesitas hacerlo perfecto. Solo cumplir hoy.",
    "Un día más es una victoria más. 🔥",
    "Tu yo del futuro agradecerá lo que haces hoy.",
    "El antojo dura minutos. Tu progreso dura mucho más.",
    "Hoy no estás perdiendo azúcar. Estás ganando disciplina.",
    "No rompas una racha por unos minutos de antojo.",
    "Cada día que cumples hace más fuerte el hábito.",
    "Tu objetivo no es sufrir. Es recuperar el control.",
    "Pequeñas decisiones producen grandes cambios.",
    "Lo difícil de hoy será normal mañana.",
    "No negocies con el antojo. Tú decides.",
    "Otro día limpio. Otro punto para ti. 🏆"
];


const achievements = [
    {
        days: 3,
        icon: "🌱",
        title: "Comenzando"
    },
    {
        days: 7,
        icon: "🔥",
        title: "Una semana"
    },
    {
        days: 15,
        icon: "⚡",
        title: "Imparable"
    },
    {
        days: 30,
        icon: "🏆",
        title: "30 días"
    },
    {
        days: 60,
        icon: "💎",
        title: "Disciplina"
    },
    {
        days: 100,
        icon: "👑",
        title: "Leyenda"
    }
];


/* =========================
   FECHAS
========================= */

function getDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
}


function createDateFromKey(key) {

    const [
        year,
        month,
        day
    ] =
        key
            .split("-")
            .map(Number);

    const date =
        new Date(
            year,
            month - 1,
            day
        );

    date.setHours(
        0,
        0,
        0,
        0
    );

    return date;
}


function isToday(date) {

    today =
        getToday();

    return (
        date.getFullYear() ===
            today.getFullYear() &&

        date.getMonth() ===
            today.getMonth() &&

        date.getDate() ===
            today.getDate()
    );
}


/* =========================
   OBTENER USUARIO
========================= */

async function getCurrentUser() {

    const {
        data: {
            user
        },
        error
    } =
        await supabase.auth
            .getUser();


    if (error) {

        console.error(
            "Error obteniendo usuario:",
            error
        );

        return null;
    }


    return user;
}


/* =========================
   CARGAR REGISTROS
========================= */

async function loadRecords() {

    if (!currentUser) {
        return;
    }


    const {
        data,
        error
    } =
        await supabase
            .from("registros")
            .select(
                "fecha, estado, fecha_registro"
            )
            .eq(
                "usuario_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Error cargando registros:",
            error
        );

        showToast(
            "No se pudieron cargar tus registros."
        );

        return;
    }


    records = {};


    data.forEach(
        row => {

            records[row.fecha] = {
                status: row.estado,
                registeredAt:
                    row.fecha_registro
            };

        }
    );


    renderCalendar();

    updateStats();
}


/* =========================
   GUARDAR REGISTRO
========================= */

async function saveRecord(
    date,
    status
) {

    if (!currentUser) {

        showToast(
            "No hay una sesión válida."
        );

        return false;
    }


    const key =
        getDateKey(date);


    const {
        error
    } =
        await supabase
            .from("registros")
            .insert({
                usuario_id:
                    currentUser.id,

                fecha:
                    key,

                estado:
                    status
            });


    if (error) {

        console.error(
            "Error guardando registro:",
            error
        );


        if (
            error.code ===
            "23505"
        ) {

            showToast(
                "🔒 Ese día ya fue registrado."
            );

        } else {

            showToast(
                "No se pudo guardar el registro."
            );

        }


        return false;
    }


    return true;
}


/* =========================
   CALENDARIO
========================= */

function renderCalendar() {

    today =
        getToday();

    calendar.innerHTML = "";

    monthTitle.textContent =
        `${MONTHS[currentMonth]} ${currentYear}`;


    const firstDay =
        new Date(
            currentYear,
            currentMonth,
            1
        );

    const lastDay =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        );

    const totalDays =
        lastDay.getDate();

    const startingDay =
        firstDay.getDay();


    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        const emptyDay =
            document.createElement(
                "div"
            );

        emptyDay.classList.add(
            "day",
            "empty"
        );

        calendar.appendChild(
            emptyDay
        );
    }


    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const date =
            new Date(
                currentYear,
                currentMonth,
                day
            );

        date.setHours(
            0,
            0,
            0,
            0
        );


        const key =
            getDateKey(date);


        const dayElement =
            document.createElement(
                "button"
            );

        dayElement.classList.add(
            "day"
        );

        dayElement.textContent =
            day;


        if (
            isToday(date)
        ) {

            dayElement.classList.add(
                "today"
            );
        }


        if (
            records[key]
        ) {

            dayElement.classList.add(
                records[key].status
            );

            dayElement.classList.add(
                "locked"
            );
        }


        /*
        SOLO HOY SE PUEDE MARCAR
        */

        if (
            !isToday(date)
        ) {

            dayElement.classList.add(
                "future"
            );

            dayElement.disabled =
                true;
        }


        /*
        SI HOY YA FUE REGISTRADO,
        TAMBIÉN SE BLOQUEA
        */

        if (
            isToday(date) &&
            records[key]
        ) {

            dayElement.disabled =
                true;
        }


        dayElement.addEventListener(
            "click",
            () =>
                selectDay(date)
        );


        calendar.appendChild(
            dayElement
        );
    }


    updateMonthStats();
}


/* =========================
   SELECCIONAR DÍA
========================= */

function selectDay(date) {

    const key =
        getDateKey(date);


    if (
        !isToday(date)
    ) {

        showToast(
            "🔒 Solo puedes registrar el día de hoy."
        );

        return;
    }


    if (
        records[key]
    ) {

        const text =
            records[key].status ===
            "success"
                ? "✅ cumplido"
                : "❌ no cumplido";


        showToast(
            `🔒 Este día ya está bloqueado como ${text}.`
        );

        return;
    }


    selectedDate =
        new Date(date);


    modalDate.textContent =
        date.toLocaleDateString(
            "es-GT",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    modal.classList.remove(
        "hidden"
    );
}


/* =========================
   REGISTRAR DÍA
========================= */

async function registerDay(
    status
) {

    if (
        !selectedDate
    ) {

        return;
    }


    if (
        !isToday(
            selectedDate
        )
    ) {

        showToast(
            "🔒 Solo puedes registrar el día de hoy."
        );

        closeModal();

        return;
    }


    const key =
        getDateKey(
            selectedDate
        );


    if (
        records[key]
    ) {

        showToast(
            "🔒 Ese día ya fue registrado."
        );

        closeModal();

        return;
    }


    if (
        status !== "success" &&
        status !== "failed"
    ) {

        return;
    }


    successBtn.disabled =
        true;

    failedBtn.disabled =
        true;


    const saved =
        await saveRecord(
            selectedDate,
            status
        );


    successBtn.disabled =
        false;

    failedBtn.disabled =
        false;


    if (
        !saved
    ) {

        return;
    }


    records[key] = {
        status: status,
        registeredAt:
            new Date()
                .toISOString()
    };


    closeModal();

    renderCalendar();

    updateStats();


    if (
        status ===
        "success"
    ) {

        showToast(
            "🔥 Día cumplido. ¡Sigue así!"
        );

    } else {

        showToast(
            "Registrado. Mañana tienes otra oportunidad."
        );
    }
}


/* =========================
   MODAL
========================= */

function closeModal() {

    modal.classList.add(
        "hidden"
    );

    selectedDate = null;
}


successBtn.addEventListener(
    "click",
    () =>
        registerDay(
            "success"
        )
);


failedBtn.addEventListener(
    "click",
    () =>
        registerDay(
            "failed"
        )
);


closeModalBtn.addEventListener(
    "click",
    closeModal
);


modal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modal
        ) {

            closeModal();
        }
    }
);


/* =========================
   CAMBIAR MES
========================= */

prevMonthBtn.addEventListener(
    "click",
    () => {

        currentMonth--;

        if (
            currentMonth < 0
        ) {

            currentMonth = 11;

            currentYear--;
        }

        renderCalendar();
    }
);


nextMonthBtn.addEventListener(
    "click",
    () => {

        currentMonth++;

        if (
            currentMonth > 11
        ) {

            currentMonth = 0;

            currentYear++;
        }

        renderCalendar();
    }
);


/* =========================
   ESTADÍSTICAS
========================= */

function updateStats() {

    const keys =
        Object
            .keys(records)
            .sort();


    let success = 0;

    let failed = 0;


    keys.forEach(
        key => {

            if (
                records[key].status ===
                "success"
            ) {

                success++;
            }


            if (
                records[key].status ===
                "failed"
            ) {

                failed++;
            }
        }
    );


    successDaysElement.textContent =
        success;

    failedDaysElement.textContent =
        failed;

    totalRegistered.textContent =
        success + failed;


    let percentage = 0;


    if (
        success + failed > 0
    ) {

        percentage =
            Math.round(
                (
                    success /
                    (
                        success +
                        failed
                    )
                ) *
                100
            );
    }


    successPercentage.textContent =
        `${percentage}%`;


    const currentStreak =
        calculateCurrentStreak();

    const bestStreak =
        calculateBestStreak();


    currentStreakElement.textContent =
        currentStreak;

    bestStreakElement.textContent =
        bestStreak;


    updateAchievements(
        bestStreak
    );


    setMotivation();
}


/* =========================
   RACHA ACTUAL
========================= */

function calculateCurrentStreak() {

    today =
        getToday();


    let streak = 0;


    let date =
        new Date(today);


    const todayKey =
        getDateKey(date);


    if (
        !records[todayKey]
    ) {

        date.setDate(
            date.getDate() - 1
        );
    }


    while (true) {

        const key =
            getDateKey(date);


        if (
            records[key] &&
            records[key].status ===
            "success"
        ) {

            streak++;

            date.setDate(
                date.getDate() - 1
            );

        } else {

            break;
        }
    }


    return streak;
}


/* =========================
   MEJOR RACHA
========================= */

function calculateBestStreak() {

    const successfulDates =
        Object
            .keys(records)
            .filter(
                key =>
                    records[key].status ===
                    "success"
            )
            .sort();


    if (
        successfulDates.length ===
        0
    ) {

        return 0;
    }


    let best = 1;

    let current = 1;


    for (
        let i = 1;
        i <
        successfulDates.length;
        i++
    ) {

        const previous =
            createDateFromKey(
                successfulDates[i - 1]
            );


        const currentDate =
            createDateFromKey(
                successfulDates[i]
            );


        const difference =
            Math.round(
                (
                    currentDate -
                    previous
                ) /
                86400000
            );


        if (
            difference === 1
        ) {

            current++;

            best =
                Math.max(
                    best,
                    current
                );

        } else {

            current = 1;
        }
    }


    return best;
}


/* =========================
   PROGRESO DEL MES
========================= */

function updateMonthStats() {

    today =
        getToday();


    const totalDays =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();


    let possibleDays =
        totalDays;


    const viewingCurrentMonth =
        currentYear ===
            today.getFullYear() &&
        currentMonth ===
            today.getMonth();


    const monthStart =
        new Date(
            currentYear,
            currentMonth,
            1
        );


    monthStart.setHours(
        0,
        0,
        0,
        0
    );


    const viewingFutureMonth =
        monthStart > today;


    if (
        viewingCurrentMonth
    ) {

        possibleDays =
            today.getDate();
    }


    if (
        viewingFutureMonth
    ) {

        possibleDays = 0;
    }


    let successful = 0;


    Object
        .keys(records)
        .forEach(
            key => {

                const date =
                    createDateFromKey(
                        key
                    );


                if (
                    date.getFullYear() ===
                        currentYear &&
                    date.getMonth() ===
                        currentMonth &&
                    records[key].status ===
                        "success"
                ) {

                    successful++;
                }
            }
        );


    let percentage = 0;


    if (
        possibleDays > 0
    ) {

        percentage =
            Math.round(
                (
                    successful /
                    possibleDays
                ) *
                100
            );
    }


    progressText.textContent =
        `${successful}/${possibleDays} · ${percentage}%`;


    progressFill.style.width =
        `${Math.min(
            percentage,
            100
        )}%`;


    monthSubtitle.textContent =
        `${successful} días sin azúcar`;
}


/* =========================
   LOGROS
========================= */

function updateAchievements(
    bestStreak
) {

    achievementsContainer.innerHTML =
        "";


    achievements.forEach(
        achievement => {

            const unlocked =
                bestStreak >=
                achievement.days;


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                `achievement ${
                    unlocked
                        ? ""
                        : "locked"
                }`;


            element.innerHTML = `

                <span
                    class="achievement-icon"
                >
                    ${achievement.icon}
                </span>

                <strong>
                    ${achievement.title}
                </strong>

                <small>
                    ${achievement.days} días
                </small>

            `;


            achievementsContainer
                .appendChild(
                    element
                );
        }
    );
}


/* =========================
   MOTIVACIÓN
========================= */

function setMotivation() {

    const date =
        getToday();


    const key =
        `${date.getFullYear()}-${
            date.getMonth()
        }-${
            date.getDate()
        }`;


    let hash = 0;


    for (
        let i = 0;
        i < key.length;
        i++
    ) {

        hash +=
            key.charCodeAt(i);
    }


    const index =
        hash %
        motivations.length;


    motivation.textContent =
        motivations[index];
}


/* =========================
   TOAST
========================= */

function showToast(
    message
) {

    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timeout
    );


    showToast.timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =========================
   TEMA
========================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "sugarFreeTheme"
        );


    if (
        theme === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

        themeBtn.textContent =
            "☀️";

    } else {

        themeBtn.textContent =
            "🌙";
    }
}


themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "sugarFreeTheme",
            dark
                ? "dark"
                : "light"
        );


        themeBtn.textContent =
            dark
                ? "☀️"
                : "🌙";
    }
);


/* =========================
   CAMBIO DE DÍA
========================= */

let lastKnownDate =
    getDateKey(
        getToday()
    );


setInterval(
    () => {

        const currentDateKey =
            getDateKey(
                getToday()
            );


        if (
            currentDateKey !==
            lastKnownDate
        ) {

            lastKnownDate =
                currentDateKey;

            today =
                getToday();

            currentYear =
                today.getFullYear();

            currentMonth =
                today.getMonth();


            renderCalendar();

            updateStats();
        }

    },
    60000
);


/* =========================
   INICIAR APP
========================= */

async function initApp() {

    loadTheme();

    setMotivation();


    currentUser =
        await getCurrentUser();


    if (
        !currentUser
    ) {

        window.location.href =
            "./login.html";

        return;
    }


    await loadRecords();
}


initApp();
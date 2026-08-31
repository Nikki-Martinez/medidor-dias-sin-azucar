import { supabase } from "./supabaseClient.js";


const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginBtn =
    document.getElementById("loginBtn");

const message =
    document.getElementById("message");

const showPassword =
    document.getElementById("showPassword");


/* =========================
   MOSTRAR CONTRASEÑA
========================= */

showPassword.addEventListener(
    "click",
    () => {

        const visible =
            passwordInput.type === "text";

        passwordInput.type =
            visible
                ? "password"
                : "text";

        showPassword.textContent =
            visible
                ? "👁️"
                : "🙈";

    }
);


/* =========================
   LOGIN
========================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            emailInput.value
                .trim();

        const password =
            passwordInput.value;


        message.textContent = "";
        message.className =
            "message";


        if (
            !email ||
            !password
        ) {

            showMessage(
                "Completa todos los campos.",
                "error"
            );

            return;

        }


        loginBtn.disabled =
            true;

        loginBtn.textContent =
            "Iniciando sesión...";


        try {

            const {
                data,
                error
            } =
                await supabase.auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {

                console.error(
                    error
                );


                showMessage(
                    traducirError(
                        error.message
                    ),
                    "error"
                );

                return;

            }


            console.log(
                "Usuario:",
                data.user
            );


            showMessage(
                "Inicio de sesión correcto ✅",
                "success"
            );


            /*
             Pequeño tiempo para que
             el usuario vea el mensaje.
            */

            setTimeout(
                () => {

                    window.location.href =
                        "./index.html";

                },
                700
            );


        } catch (error) {

            console.error(
                error
            );


            showMessage(
                "No fue posible conectarse con el servidor.",
                "error"
            );

        } finally {

            loginBtn.disabled =
                false;

            loginBtn.textContent =
                "Iniciar sesión";

        }

    }
);


/* =========================
   MENSAJES
========================= */

function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        `message ${type}`;

}


/* =========================
   TRADUCIR ERRORES COMUNES
========================= */

function traducirError(
    error
) {

    const text =
        error.toLowerCase();


    if (
        text.includes(
            "invalid login credentials"
        )
    ) {

        return "Correo o contraseña incorrectos.";

    }


    if (
        text.includes(
            "email not confirmed"
        )
    ) {

        return "Debes confirmar tu correo antes de iniciar sesión.";

    }


    if (
        text.includes(
            "too many requests"
        )
    ) {

        return "Demasiados intentos. Espera unos minutos.";

    }


    return error;

}


/* =========================
   VERIFICAR SESIÓN
========================= */

async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabase.auth
            .getSession();


    /*
     Si ya tiene sesión,
     no mostramos el login.
    */

    if (session) {

        window.location.href =
            "./index.html";

    }

}


checkSession();
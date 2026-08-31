import { supabase } from "./supabaseClient.js";

const registerForm =
    document.getElementById("registerForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const registerBtn =
    document.getElementById("registerBtn");

const message =
    document.getElementById("message");

const showPassword =
    document.getElementById("showPassword");

const showConfirmPassword =
    document.getElementById("showConfirmPassword");


showPassword.addEventListener(
    "click",
    () => {

        togglePassword(
            passwordInput,
            showPassword
        );

    }
);


showConfirmPassword.addEventListener(
    "click",
    () => {

        togglePassword(
            confirmPasswordInput,
            showConfirmPassword
        );

    }
);


function togglePassword(
    input,
    button
) {

    const visible =
        input.type === "text";

    input.type =
        visible
            ? "password"
            : "text";

    button.textContent =
        visible
            ? "👁️"
            : "🙈";

}


registerForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        message.textContent = "";
        message.className =
            "message";


        if (
            !email ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                "Completa todos los campos.",
                "error"
            );

            return;

        }


        if (
            password.length < 6
        ) {

            showMessage(
                "La contraseña debe tener al menos 6 caracteres.",
                "error"
            );

            return;

        }


        if (
            password !==
            confirmPassword
        ) {

            showMessage(
                "Las contraseñas no coinciden.",
                "error"
            );

            return;

        }


        registerBtn.disabled =
            true;

        registerBtn.textContent =
            "Creando cuenta...";


        try {

            const {
                data,
                error
            } =
                await supabase.auth.signUp({
                    email,
                    password
                });


            if (error) {

                console.error(error);

                showMessage(
                    traducirError(
                        error.message
                    ),
                    "error"
                );

                return;

            }


            console.log(
                "Registro:",
                data
            );


            /*
             Si Supabase exige
             confirmación por correo,
             normalmente tendremos usuario
             pero no sesión todavía.
            */

            if (
                data.user &&
                !data.session
            ) {

                showMessage(
                    "✅ Cuenta creada. Revisa tu correo para confirmar tu cuenta.",
                    "success"
                );

                registerForm.reset();

                return;

            }


            /*
             Si la confirmación de correo
             está deshabilitada,
             podría iniciar sesión
             inmediatamente.
            */

            if (
                data.session
            ) {

                showMessage(
                    "✅ Cuenta creada correctamente.",
                    "success"
                );

                setTimeout(
                    () => {

                        window.location.href =
                            "./index.html";

                    },
                    1000
                );

            }


        } catch (error) {

            console.error(error);

            showMessage(
                "No fue posible conectarse con el servidor.",
                "error"
            );

        } finally {

            registerBtn.disabled =
                false;

            registerBtn.textContent =
                "Crear cuenta";

        }

    }
);


function showMessage(
    text,
    type
) {

    message.textContent =
        text;

    message.className =
        `message ${type}`;

}


function traducirError(error) {

    const text =
        error.toLowerCase();


    if (
        text.includes(
            "user already registered"
        )
    ) {

        return "Este correo ya está registrado.";

    }


    if (
        text.includes(
            "password"
        )
    ) {

        return "La contraseña no cumple los requisitos.";

    }


    if (
        text.includes(
            "invalid email"
        )
    ) {

        return "El correo electrónico no es válido.";

    }


    if (
        text.includes(
            "rate limit"
        )
    ) {

        return "Demasiados intentos. Espera unos minutos.";

    }


    return error;

}


/*
 =========================
 SI YA HAY SESIÓN,
 NO MOSTRAR REGISTRO
 =========================
*/

async function checkSession() {

    const {
        data: {
            session
        }
    } =
        await supabase.auth.getSession();


    if (session) {

        window.location.href =
            "./index.html";

    }

}


checkSession();
import { supabase } from "./supabaseClient.js";

/*
========================================
PROTEGER LA APLICACIÓN
========================================
*/

async function protegerPagina() {

    const {
        data: { session },
        error
    } = await supabase.auth.getSession();


    if (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

        window.location.href =
            "./login.html";

        return;
    }


    /*
    Si NO existe sesión,
    sacar al usuario.
    */

    if (!session) {

        window.location.href =
            "./login.html";

        return;
    }

    mostrarUsuario(
        session.user
    );

}


/*
========================================
MOSTRAR USUARIO
========================================
*/

function mostrarUsuario(user) {

    const userEmail =
        document.getElementById(
            "userEmail"
        );


    if (userEmail) {

        userEmail.textContent =
            user.email;

    }

}


/*
========================================
CERRAR SESIÓN
========================================
*/

async function cerrarSesion() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.disabled =
            true;

        logoutBtn.textContent =
            "Saliendo...";

    }


    const { error } =
        await supabase.auth.signOut();


    if (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );


        if (logoutBtn) {

            logoutBtn.disabled =
                false;

            logoutBtn.textContent =
                "Salir";

        }

        return;
    }


    window.location.href =
        "./login.html";

}


/*
========================================
BOTÓN LOGOUT
========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                cerrarSesion
            );

        }


        protegerPagina();

    }
);


/*
========================================
ESCUCHAR CAMBIOS DE SESIÓN
========================================
*/

supabase.auth.onAuthStateChange(
    (event, session) => {

        if (
            event === "SIGNED_OUT" ||
            !session
        ) {

            window.location.href =
                "./login.html";

        }

    }
);
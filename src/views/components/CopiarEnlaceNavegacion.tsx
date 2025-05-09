"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Share, CircleCheck } from "lucide-react";
import styled from "styled-components";
import { toast, ToastContainer} from "react-toastify";
import "react-toastify/ReactToastify.css";
import { motion } from "framer-motion";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const IconosCompartirLike = styled.div`
    margin-left: 81%;
    margin-top: -8%;
    width: 50px;

`;

export default function CopiarEnlaceNavegacion({url, songID} : { url : string, songID : string}){
    /* Almacenamiento de la ruta */
    const [ ruta, setRuta ] = useState(""); //Donde se guarda la URL
    const router = useRouter();
    const [ clicked, setClicked] = useState(false);

    useEffect(() => {
        /* 
           Comprueba que estamos ejecutando esto en la parte del cliente,
           en la parte del servidor no se podría hacer
        */
        if ( typeof window !== "undefined") {
            /* Ontiene la ruta de la página actual */
            setRuta(window.location.href);
            console.log(ruta);
        }
        /* Cuando se renderiza este componente quiero que aparezcan de color blanco */
        setClicked(false);
    }, []);

    const copiarPortapapeles = async () => {
        try {
            /* Asegurarse de que el código solo se ejecuta en el cliente */
            await navigator.clipboard.writeText(ruta);
            /* Da animación a un mensaje por pantalla, mejor que el alert */
            toast.success(" ¡Enlace copiado al portapapeles!", {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "light" // se puede cambiar a "colored" o "dark".
            });
        } catch ( err ) {
            console.error("Error al copiar el enlace", err);
            toast.error(" Error al copiar el enlace");
        }
    };

    const descarga = async () => {
        if (!url) {
            toast.error("No hay archivo disponible para descargar");
            return;
        }

        // Construye la ruta completa del archivo MP3
        const rutaCompleta = url.startsWith('http') ? url : `${window.location.origin}/localDB${url}`;
        console.log(rutaCompleta);
        
        // Crea un enlace temporal para forzar la descarga
        const link = document.createElement('a');
        link.href = rutaCompleta;
        link.download = url.split('/').pop() || 'audio.mp3'; // Nombre del archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(" ¡Descarga de audio completada!", {
            position: "bottom-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "light" // se puede cambiar a "colored" o "dark".
        });
    };

    const añadirFavoritos = async () => {
        try {
            // Enviamos al backend la cancion que el usuario ha marcado como favortia
            const uid = localStorage.getItem("uid");
            const response = await fetch("http://localhost:8000/favoritos", {
                method : "POST",
                headers : {
                    "Content-Type": "application/json"
                },
                body : JSON.stringify({ 
                    songID,
                    uid, 
                }),
            });

            if ( !response.ok ) {
                throw new Error("Error al guardar favorito");
            }

            // Mostramos al usuario que se ha añadido a favoritos su canción
            setClicked(true);
            toast.success("❤️ Añadido a canciones que te gustan", {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "light" 
            });
        } catch ( err ){
            toast.error("Error al añadir a favoritos");
        }
    };


    return (
       <IconosCompartirLike style={{ display: "flex"}}>
            <motion.div
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1}}
                onClick={copiarPortapapeles}
                style={{ cursor: "pointer"}}
            >
                <Share />
            </motion.div>
            <motion.div
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                onClick={añadirFavoritos}
                style={{ cursor: "pointer", color : clicked ? "green" : "white"}}
            >
                <CircleCheck />
            </motion.div>
            <motion.div
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1}}
                onClick={descarga}
                style={{ cursor: "pointer"}}
            >
                <a href={url} download><FileDownloadIcon /></a>
            </motion.div>
            <ToastContainer />
        </IconosCompartirLike> 
    );
}
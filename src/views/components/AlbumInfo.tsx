"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import colors from "../../app/colors";
import Image from "next/image";
import defaultAlbum from "../../assets/img/defaultAlbum.jpg";
import defaultAvatar from "../../assets/img/defaultAvatar.jpg";
import AlbumSongs from "./AlbumSongs";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaidIcon from "@mui/icons-material/Paid";
import Link from "next/link";
import { useShoppingCart } from "./ShoppingCartContext";
import ShopValidator, { animacionEntrada } from "./ShopValidator";
import { useAuth } from "./AuthContext";
import { toast, ToastContainer } from "react-toastify";
import PrimaryButton from "./PrimaryButton";

type Album = {
  id: number;
  name: string; //
  artist: string; //
  canciones: {
    id: number;
    titulo: string;
    url: string;
    image: string;
    time: string;
  }[];
  image: string; //
  genre: string;
  imagenGrupo?: string;
  uploadDate?: string;
  price?: string;
};

type Cancion ={
  id: string;
  name: string;
  trackLength: string;
  album: string;
  genre: string;
}

type Artista = {
  id: string;
  name: string;
  image:string;
}

const getAlbumFullDuration = (
  canciones: Cancion[]
) => {
  let totalSegundos = 0;

  canciones.forEach((cancion) => {
    const [minutos, segundos] = cancion.trackLength.split(":").map(Number);
    totalSegundos += minutos * 60 + segundos;
  });

  const totalMinutos = Math.floor(totalSegundos / 60);
  const segundosRestantes = totalSegundos % 60;

  return `${totalMinutos}:${segundosRestantes.toString().padStart(2, "0")}`;
};

const AlbumInfo = ({ id }: { id: string }) => {
  const [album, setAlbum] = useState<Album | null>(null);
  const [canciones, setCanciones] = useState<Cancion[]>([]);
  const [artist, setArtist] = useState<Artista>("");
  const [validacionTienda, setValidacionTienda] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { userRole } = useAuth();

  const { addToCart } = useShoppingCart();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:8000/album/" + id);
      const data = await response.json();
      const albumId = data.id;
      if (data) {
        setAlbum(data);
      }
      const cancionesResponse = await fetch(
        "http://localhost:8000/get_album_songs/" + albumId
      );
      const cancionesData = await cancionesResponse.json();
      console.log(cancionesData);
      if (cancionesData) {
        setCanciones(cancionesData);
      }

      const artistResponse = await fetch(
        "http://localhost:8000/artist/" + data.artist
      );
      const artistData = await artistResponse.json();
      setArtist(artistData);
    }
    fetchData();
  }, []);

  const songs = canciones.length || 0;
  const duration = getAlbumFullDuration(canciones || []);
  const date = new Date(album?.uploadDate || 2020);
  const year = date.getFullYear();

  const manejadorValidador = () => {
    if (userRole !== "invitado") {
      setValidacionTienda(!validacionTienda);
    } else {
      toast.warn("¡Ciudado!, debes de iniciar sesión", {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "light",
      });
    }
  };

  return (
    <div style={{ width: "100%", display: "flex" }}>
      <AlbumContainer>
        <AlbumImage>
          <Image
            src={album ? `/localDB${album?.image}` : defaultAlbum}
            alt={album?.name || "album cover"}
            width={230}
            height={230}
          />
        </AlbumImage>
        <AlbumTitle>{album?.name}</AlbumTitle>
        <Link href={`/artist/${album?.artist}`}>
          <AlbumArtist>
            <AlbumArtistImg>
              <Image
                src={artist ? `/localDB${artist.image}` : defaultAvatar}
                alt={album?.artist || "artist img"}
                width={30}
                height={30}
              />
            </AlbumArtistImg>
            {album?.artist}
          </AlbumArtist>
        </Link>
        <Row>
          <BuyButton
            onClick={() => {
              addToCart({
                id: album?.id.toString() || "",
                name: album?.name || "",
                image: album ? `/localDB${album?.image}` : defaultAlbum,
                price: parseFloat(album?.price || "0.00"),
                quantity: 1,
              });
            }}
          >
            <ShoppingCartIcon />
            Añadir al carrito
          </BuyButton>
          <BuyButton
            onClick={() => {
              manejadorValidador();
              if (userRole === "invitado") {
                setIsOpen(true);
                <ToastContainer />;
              }
            }}
          >
            <PaidIcon />
            Comprar en 1 click
          </BuyButton>
        </Row>
      </AlbumContainer>
      <div style={{ width: "70%" }}>
        <AlbumOtherInfo>
          <AlbumInfoRow>
            {year || "2020"} · {album?.genre} · {album?.price || "0.00"} €
          </AlbumInfoRow>
          <AlbumInfoSeparator />
          <AlbumInfoRow>
            {songs + " canciones"} · {duration + " minutos"}
          </AlbumInfoRow>
          <SongsContainer>
            <AlbumSongs canciones={canciones || []} />
          </SongsContainer>
        </AlbumOtherInfo>
      </div>
      {validacionTienda && (
        <ShopValidator
          isOpen={validacionTienda}
          onClose={manejadorValidador}
          imagen={album}
        />
      )}
      {!validacionTienda && (
        <DeployRestrictiveBackground $isOpen={isOpen}>
          <DeployContent>
            <ToastContainer />
            <h2 style={{ padding: "50px" }}>
              Debes iniciar sesión para acceder a este contenido
            </h2>
            <BotonCerrar onClick={() => setIsOpen(false)}>✖</BotonCerrar>
            <Link href="/login">
              <PrimaryButton
                text="Iniciar Sesión"
                onClick={() => {}}
                style={{ textAlign: "center" }}
                type="button"
              />
            </Link>
          </DeployContent>
        </DeployRestrictiveBackground>
      )}
    </div>
  );
};

const AlbumContainer = styled.div`
  padding: 20px;
  width: 30%;
  display: flex;
  flex-direction: column;
  border: 1px solid ${colors.tertiary};
  gap: 15px;
  margin-right: 20px;
  border-radius: 10px;
  align-items: center;
`;

const AlbumImage = styled.div`
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
  height: fit-content;
  display: flex;
  justify-content: center;
  border: 2px solid ${colors.primary};
  align-items: center;
  background-color: gray;
  margin: 0 auto;
`;

const AlbumTitle = styled.h1`
  width: 80%;
  margin: 0 auto;
  font-size: 1.5rem;
  font-weight: bold;
  text-transform: capitalize;
  text-align: center;
`;

const AlbumArtist = styled.span`
  font-size: 1rem;
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid ${colors.primary};
  border-radius: 10px;
  padding: 8px 15px;
`;

const AlbumArtistImg = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: gray;
  margin: 0 auto;
`;

const AlbumOtherInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  border-radius: 10px;
`;

const AlbumInfoRow = styled.div`
  display: flex;
  font-size: 1rem;
`;

const AlbumInfoSeparator = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.tertiary};
`;

const SongsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  border: 1px solid ${colors.tertiary};
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
`;

const BuyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: ${colors.tertiary};
  color: ${colors.secondary};
  border: none;
  padding: 8px 15px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const DeployRestrictiveBackground = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px); // Agrega un desenfoque al fondo
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 103;
`;

const DeployContent = styled.div`
  background: ${colors.background};
  color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
  animation: ${animacionEntrada} 0.3s ease-in-out;
  position: relative;
  max-width: 700px;
  height: 70vh;
  width: 90%;
  text-align: center;
  margin-bottom: 10px;
  z-index: 104;
`;

const BotonCerrar = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: ${colors.background};
  color: ${colors.secondary};
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background: ${colors.primary};
  }
`;

export default AlbumInfo;

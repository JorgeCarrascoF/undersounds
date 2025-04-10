import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import styled from 'styled-components';
import colors from '../../app/colors';

type Song = {
  name: string;
  file?: File;
};

interface AddSongProps {
  onSongsChange: (songs: { name: string; file: File }[]) => void;
}

const AddSong: React.FC<AddSongProps> = ({ onSongsChange }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [newSong, setNewSong] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  useEffect(() => {
    const songsWithFiles = songs
      .filter(song => song.file)
      .map(song => ({ name: song.name, file: song.file as File }));
    onSongsChange(songsWithFiles);
  }, [songs, onSongsChange]);

  const handleAddSongClick = () => {
    setIsAdding(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewSong(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newSong.trim()) {
      const updatedSongs = [...songs, { name: newSong }];
      setSongs(updatedSongs);
      setNewSong('');
      setIsAdding(false);
      setCurrentIndex(updatedSongs.length - 1);
    }
  };

  const handleFileChange = (index: number, file: File) => {
    const updatedSongs = songs.map((song, i) =>
      i === index ? { ...song, file } : song
    );
    setSongs(updatedSongs);
    setCurrentIndex(null);
  };

  return (
    <Container>
      <div>
        <SongList>
          {songs.map((song, index) => (
            <SongItem key={index}>
              {song.name}
              {index === currentIndex ? (
                <FileInput
                  type="file"
                  accept="audio/mpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(index, e.target.files[0]);
                    }
                  }}
                />
              ) : song.file ? (
                <FileName>🎵 {song.file.name}</FileName>
              ) : null}
            </SongItem>
          ))}
        </SongList>

        {isAdding ? (
          <SongInput
            type="text"
            value={newSong}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe el nombre de la canción..."
            autoFocus
          />
        ) : (
          <AddButton onClick={handleAddSongClick} style={{ marginTop: "10px" }}>
            <AddIcon /> Añadir canción
          </AddButton>
        )}
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const AddButton = styled.button`
  border: none;
  background: none;
  font-size: 16px;
  color: ${colors.primary};
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const SongInput = styled.input`
  padding: 8px;
  font-size: 14px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 250px;
`;

const SongList = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;

const SongItem = styled.div`
  margin: 5px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileInput = styled.input`
  margin-top: 6px;
`;

const FileName = styled.span`
  font-size: 12px;
  color: ${colors.secondary};
  margin-top: 4px;
  margin-left: 2px;
`;

export default AddSong;
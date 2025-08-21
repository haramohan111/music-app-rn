// AllMusicp.jsx
import React, { useState, useEffect } from 'react';
import '../styles/AllMusicp.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMusic } from '../redux/features/music/allMusicSlice';
import { FaMusic, FaPlayCircle } from 'react-icons/fa';
import { useOutletContext } from 'react-router-dom';

const AllMusicp = () => {
  const [musicList, setMusicList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

     const { handlePlaySong } = useOutletContext();

  const dispatch = useDispatch();
  const { tracks, isLoading, error } = useSelector((state) => state.music);

  // Fetch music from Redux
  useEffect(() => {
    dispatch(fetchAllMusic());
  }, [dispatch]);

  // When tracks update, store in local state
  useEffect(() => {
    if (tracks?.data) {
      setMusicList(tracks.data);
      setFilteredMusic(tracks.data);
    }
  }, [tracks]);

  // Search filter
  useEffect(() => {
    const results = musicList.filter(
      (song) =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMusic(results);
    setCurrentPage(1);
  }, [searchTerm, musicList]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMusic.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMusic.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };


      const handlePlay = (title,subtitle,cover,audioFile) => {
    handlePlaySong({
      title,
      artist: subtitle,
      cover,
      audioFile
    });
  };
  return (
    <div className="all-music-container">
      <h1 className="title">All Music</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search songs or artists..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-barp"
      />

      {/* Music List */}
      {isLoading ? (
        <p>Loading music...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="music-grid">
          {currentItems.map((song) => (
            <div key={song._id} className="music-card">
              <img
                src={`http://localhost:5000/covers/${song?.coverImage}`}
                alt={song?.title}
                className="cover-image"
                onClick={()=>handlePlay(song?.title,song?.artist,song?.coverImage,song?.audioFile)}
              />
              <h3>
                <FaMusic className="playlist-icon" /> {song?.title}
              </h3>
              {/* <p>{song?.artist}</p> */}
              <button className="play-btn">
                <FaPlayCircle size={28} /> Play
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          ⬅ Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default AllMusicp;

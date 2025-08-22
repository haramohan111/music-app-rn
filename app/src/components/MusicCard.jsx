import { FaPlay, FaEllipsisV } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../styles/MusicCard.css';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { addSongsToPlaylist, fetchPlaylists, resetPlaylistState } from '../redux/features/playlist/playlistSlice';
import { toast } from 'react-toastify';

export default function MusicCard({ title, musicId, subtitle, cover, audioFile, onPlay }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { handlePlaySong } = useOutletContext();
  const [refresh, setRefresh] = useState(false);
  const { user, status, error } = useSelector((state) => state.auth);
  const { playlist } = useSelector((state) => state.playlists);



  const dispatch = useDispatch();
  useEffect(() => {
    // Check if user is logged in

    if (user?._id) {
      setIsLoggedIn(true);

    } else {
      setIsLoggedIn(false);
    }

  }, [status, user]);





  useEffect(() => {
    dispatch(fetchPlaylists())
    if (refresh) {
      setRefresh(false);
      dispatch(fetchPlaylists())
    }
  }, [dispatch, refresh])

  const handlePlay = () => {
    handlePlaySong({
      title,
      artist: subtitle,
      cover,
      audioFile
    });
  };

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setShowMenu(!showMenu);
  };

  const handleModalOption = (musicId, playlistId) => {
    console.log(`${musicId} clicked for ${playlistId}`);
    dispatch(addSongsToPlaylist({ musicId, playlistId }))
    setShowModal(false);
    // Add your logic here for each option
  };

  return (
    <div
      className="music-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="card-img">
        <img src={`${cover}`} alt={title} className="card-img" />

        {/* Three-dot menu button */}
        {isLoggedIn ?
          <div
            className="three-dot-menu"
            onClick={handleMenuClick}
            onMouseEnter={(e) => e.stopPropagation()}
          >
            <FaEllipsisV />
          </div>
          : ""}

        {isHovered && (
          <div className="play-btn">
            <FaPlay />
          </div>
        )}
      </div>

      <h3 className="card-title">{title}</h3>
      <p className="card-subtitle">{subtitle}</p>

      {/* Dropdown menu */}
      {isLoggedIn ? showMenu && (
        <div
          className="menu-dropdown"
          onMouseLeave={() => setShowMenu(false)}
        >
          <div className="menu-item" onClick={() => setShowModal(true)}>Add to Playlist</div>
          <div className="menu-item" onClick={() => handleModalOption('favorite')}>Add to Favorite</div>
        </div>
      ) : ""}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add to Playlist</h3>
            <button
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              &times; {/* This is the X symbol */}
            </button>
            <div className="modal-options">
              {playlist?.data?.map((playlist) => (

                <div className="modal-option" key={playlist?._id} onClick={() => handleModalOption(musicId, playlist?._id)}>{playlist?.name}</div>


              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
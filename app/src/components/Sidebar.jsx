import { useEffect, useState } from 'react';
import {
  FaHome,
  FaSearch,
  FaBook,
  FaPlusSquare,
  FaHeart,
  FaMusic,
  FaTimes
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import LoginModal from './Login';
import '../styles/Sidebar.css';
import { createPlaylist, fetchPlaylists } from '../redux/features/playlist/playlistSlice';
import { verifyUser } from '../redux/features/auth/authSlice';


export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [userName, setUserName] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const dispatch = useDispatch();
  const { user, status, error } = useSelector((state) => state.auth);
  const { playlist, playlistStatus } = useSelector((state) => state.playlists);


  useEffect(() => {

    if (user !==null) {
      setIsLoggedIn(true);
      setUserName(user);
    } else {
      setIsLoggedIn(false);
      setUserName(null);
    }
  }, [status, user]);

  useEffect(() => {
    dispatch(fetchPlaylists())
    if (refresh) {
      setRefresh(false);
      dispatch(fetchPlaylists())
    }
  }, [dispatch, user, refresh])

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    console.log('Creating playlist:', playlistName);
    dispatch(createPlaylist({ name: playlistName }))
    setPlaylistName('');
    setIsModalOpen(false);
    setRefresh(!refresh);
  };

  const handlePlaylist = () => {
    if (isLoggedIn) {
      setIsModalOpen(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setIsModalOpen(true); // Open playlist modal after successful login
  };



  return (
    <>

      <aside className="sidebar">
        <nav className="nav-menu">
          <Link to="/" className="nav-item active">
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          {/* <Link to="/d" className="nav-item">
            <FaMusic className="nav-icon" />
            <span>All Music</span>
          </Link> */}
          <Link to="/allmusic" className="nav-item">
            <FaMusic className="nav-icon" />
            <span>All Music</span>
          </Link>
          {/* <a href="#" className="nav-item">
            <FaSearch className="nav-icon" />
            <span>Search</span>
          </a> */}
          {/* <a href="#" className="nav-item">
            <FaBook className="nav-icon" />
            <span>Your Library</span>
          </a> */}
          {/* <a href="#" className="nav-item">
            <FaHeart className="nav-icon" />
            <span>Liked Songs</span>
          </a> */}
          <button
            className="nav-item"
            onClick={() => handlePlaylist()}
          >
            <FaPlusSquare className="nav-icon" />
            <span>Create Playlist</span>
          </button>

          <div className="user-playlists-nav">
              {isLoggedIn && (
    <>
            {playlistStatus === 'loading' ? (
              <div className="nav-item">Loading playlists...</div>
            ) : playlist && playlist?.data?.length > 0 ? (
              playlist?.data?.map((playlist) => (
                <Link
                  to={`/playlistsongs/${playlist._id}`}
                  className="nav-item playlist-nav-item"
                  key={playlist._id}
                >
                  <FaMusic className="nav-icon" />
                  <span>{playlist.name}</span>
                </Link>
              ))
            ) : isLoggedIn ? (
              <div className="nav-item">No playlists yet</div>
            ) : null}
                </>
  )}
          </div>

        </nav>

        {/* <div className="playlists">
          <a href="#" className="playlist-item">Today's Top Hits</a>
          <a href="#" className="playlist-item">Discover Weekly</a>
          <a href="#" className="playlist-item">Chill Vibes</a>
          <a href="#" className="playlist-item">Workout Mix</a>
        </div> */}
      </aside>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay-playlist">
          <div className="modal-playlist">
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>

            <h2>Create New Playlist</h2>

            <form onSubmit={handleCreatePlaylist}>
              <div className="form-group">
                <label htmlFor="playlist-name">Playlist Name</label>
                <input
                  id="playlist-name"
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" onClick={() => setShowLoginModal(true)}>
                Create Playlist
              </button>
            </form>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="modal-overlay">
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      )}

    </>
  );
}
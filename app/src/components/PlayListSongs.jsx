import React, { useState, useEffect } from 'react';
import "../styles/PlayListSongs.css";
import { FaPlay, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaylistSongs, removeSongFromPlaylist } from '../redux/features/playlist/playlistSlice';
import { Link, useOutletContext, useParams } from 'react-router-dom';

const PlayListSongs = () => {
  const [songs, setSongs] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { handlePlaySong } = useOutletContext();
  const currentPlaylist = useSelector(state => state.playlists.currentPlaylist); // Assuming you store current playlist in Redux
  const { playlistSongs } = useSelector((state) => state.playlists);

  const dispatch = useDispatch();

  //get id from params
  const { id } = useParams();


  // Mock data or fetch from API
  // useEffect(() => {
  //   // This would typically come from your API/Redux
  //   const mockSongs = [
  //     { id: 1, title: "Blinding Lights", artist: "The Weeknd", duration: "3:20" },
  //     { id: 2, title: "Save Your Tears", artist: "The Weeknd", duration: "3:35" },
  //     { id: 3, title: "Stay", artist: "The Kid LAROI, Justin Bieber", duration: "2:21" }
  //   ];
  //   setSongs(mockSongs);
  // }, [currentPlaylist]); // Update when playlist changes
  useEffect(() => {
    if (id) {
      dispatch(fetchPlaylistSongs(id));
    }
    if (refresh) {
      setRefresh(false);
      dispatch(fetchPlaylistSongs(id));
    }
    // if (currentPlaylist && currentPlaylist.songs) {
    //   setSongs(currentPlaylist.songs);
    // } else {
    //   setSongs([]); // Reset if no current playlist
    // }
  }, [dispatch, currentPlaylist, id, refresh]);

  const handleRemoveSong = (songId) => {
    // setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
    // Here you would also call your API to remove from backend
    // console.log(`Removing song ${songId} from playlist  ${id}`);
    dispatch(removeSongFromPlaylist({ musicId: songId, playlistId: id }));
    setRefresh(true);
  };

  // const handlePlay = (title, subtitle, cover, audioFile) => {
  //   handlePlaySong({
  //     title,
  //     artist: subtitle,
  //     cover,
  //     audioFile
  //   });
  // };


 // ✅ put it here
  // const handlePlay = (songsToPlay) => {
  //   if (!songsToPlay || songsToPlay.length === 0) return;

  //   const firstSong = songsToPlay[0].songs;
  //   handlePlaySong({
  //     title: firstSong.title,
  //     artist: firstSong.artist,
  //     cover: firstSong.coverImage,
  //     audioFile: firstSong.audioFile,
  //     playlist: songsToPlay.map((s) => ({
  //       title: s.songs.title,
  //       artist: s.songs.artist,
  //       cover: s.songs.coverImage,
  //       audioFile: s.songs.audioFile,
  //     })),
  //   });
  // };
  

  return (
    <main className="main-content">
      {/* Music Profile Section */}
      <div className="music-profile" onClick={handlePlay}>
        <img
          src={
            playlistSongs?.data?.length > 0
              ? `http://localhost:5000/covers/${playlistSongs?.data[0]?.songs?.coverImage}`
              : "https://source.unsplash.com/random/300x300/?music,album"
          }
          alt="Album Cover"
          className="profile-image"
        />

        <div className="profile-info">
          <h1 className="profile-title">Current Favorite</h1>
          <p className="profile-artist">By Various Artists</p>
          <p>Your most played tracks this week</p>
        </div>
        <button className="play-button">
          <FaPlay />
        </button>
      </div>

      {/* Songs List Section */}
      {playlistSongs?.data?.length > 0 ? (
        <div className="songs-list">
          <div className="songs-header">
            <h2>Playlist · {songs.length} {songs.length === 1 ? 'Song' : 'Songs'}</h2>
          </div>
          <table className="songs-table">
            {/* <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Artist</th>
                <th>Action</th>
              </tr>
            </thead> */}
            <tbody>
              {playlistSongs?.data.map((song, index) => (
                <tr key={index}>
                  <td><img src={`http://localhost:5000/covers/${song?.songs?.coverImage}`} onClick={() => handlePlay(song?.songs?.title, song?.songs?.artist, song?.songs?.coverImage, song?.songs?.audioFile)} height={50} width={50} /></td>
                  <td>{song?.songs?.title}</td>
                  <td>{song?.songs?.artist}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveSong(song?.songs?._id)}
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
     ) : (
      
        <div className="empty-playlist">
          <h2>Just Updated · 0 Song</h2>
          <p>It's pretty quiet in here.<br />Let's find some tunes for your playlist!</p>
          <Link to="/" className="browse-btn">Browse New Releases</Link>
        </div>
       )} 
    </main>
  );
};

export default PlayListSongs;
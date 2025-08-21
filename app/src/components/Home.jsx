import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Player from './Player'
import FeaturedCard from './FeaturedCard'
import CategoryRow from './CategoryRow'
import '../App.css'
import AllMusic from './AllMusic-test.jsx'
import { Outlet } from 'react-router-dom'
import useAuthGuard from '../guard/useAuthGuard'


function Home() {
  useAuthGuard();

  const [currentSong, setCurrentSong] = useState()
  const [isPlaying, setIsPlaying] = useState(false)

  // Function to handle when a song is selected to play
  const handlePlaySong = (song) => {
    setCurrentSong({
      title: song?.title,
      artist: song?.artist,
      cover: song?.cover,
      audioSrc: song?.audioFile
    })
    setIsPlaying(true)
  }

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <Sidebar />
        <main className="content">
          <Outlet context={{ handlePlaySong }} />
        </main>
      </div>
      {currentSong && (
        <Player
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onSongSelect={handlePlaySong}
        />
      )}
      {/* Uncomment the following lines to display the player at the bottom */}
      {/* <Player 
                currentSong={currentSong} 
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onSongSelect={handlePlaySong}
            /> */}

    </div>
  )
}

// Sample data
const recentlyPlayed = [
  {
    id: 1,
    title: "Blinding Lights",
    artist: "The Weeknd",
    cover: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268",
    type: "song"
  },
  // Add more items...
]

const popularAlbums = [
  {
    id: 1,
    title: "After Hours",
    artist: "The Weeknd",
    cover: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268",
    type: "album"
  },
  // Add more items...
]

const trendingPlaylists = [
  {
    id: 1,
    title: "Today's Top Hits",
    description: "The Weeknd is on top",
    cover: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268",
    type: "playlist"
  },

]



export default Home
import { useState, useRef, useEffect } from 'react'
import {
  FaRandom,
  FaStepBackward,
  FaStepForward,
  FaRedo,
  FaVolumeUp,
  FaExpand,
  FaHeart,
  FaEllipsisH,
  FaPlay,
  FaPause
} from 'react-icons/fa'
import api from '../services/api'

export default function Player({ currentSong }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [coverUrl, setCoverUrl] = useState("");

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio()
    audioRef.current.volume = volume

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
    }
  }, [])

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const togglePlay = async () => {
    if (!audioRef.current || !currentSong) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        // If audio hasn't been played yet, we may need to load it first
        if (!isReady) {
          await loadAudio()
        }
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error('Playback error:', err)
      setError('Failed to play audio. ' + err.message)
      setIsPlaying(false)
      setIsReady(false)
    }
  }

  const loadAudio = async () => {
    if (!currentSong?.audioSrc || !audioRef.current) return

    try {
      setError(null)
      setIsReady(false)

      // Verify the audio source exists
      // const response = await fetch(`http://localhost:5000/api/v1/audio/${currentSong.audioSrc}`)
      // if (!response.ok) throw new Error('Audio file not found')
      await api.get(`/audio/${currentSong.audioSrc}`, { responseType: 'blob' });
      // Load the audio
      audioRef.current.src = `http://localhost:5000/api/v1/audio/${currentSong.audioSrc}`
      await new Promise((resolve, reject) => {
        audioRef.current.oncanplay = resolve
        audioRef.current.onerror = reject
        audioRef.current.load()
      })

      setIsReady(true)
    } catch (err) {
      console.error('Audio load error:', err)
      setError('Failed to load audio. ' + err.message)
      setIsReady(false)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value)
    setProgress(newProgress)
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (newProgress / 100) * duration
    }
  }

  // Handle song changes
  useEffect(() => {
    if (!currentSong?.audioSrc) return

    const loadNewAudio = async () => {
      await loadAudio()
      if (isPlaying && isReady) {
        try {
          await audioRef.current.play()
        } catch (err) {
          console.error('Autoplay failed:', err)
          setIsPlaying(false)
        }
      }
    }

    loadNewAudio()
  }, [currentSong])

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      if (duration > 0) {
        setProgress((audio.currentTime / duration) * 100)
      } else {
        setProgress(0)
      }
    }


    const setAudioData = () => {
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', setAudioData)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', setAudioData)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [duration])


  useEffect(() => {
    async function loadCover() {
      if (!currentSong?.cover) {
        setCoverUrl("");
        return;
      }

      // Simulate await logic (fetch, check file exists, etc.)
      const url = `http://localhost:5000/covers/${currentSong?.cover}`;

      // Optional: check if the image exists before setting
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) {
          setCoverUrl(url);
        } else {
          setCoverUrl("/fallback.jpg"); // fallback image
        }
      } catch {
        setCoverUrl("/fallback.jpg");
      }
    }

    loadCover();
  }, [currentSong]);

  return (
    <footer className="player">
      {error && <div className="player-error">{error}</div>}

      <div className="song-info">
        {currentSong ? (
          <>
            <img
              src={coverUrl ? coverUrl : "hi"}
              alt="Song"
              className="song-img"
            />
            <div className="song-details">
              <h4>{currentSong?.title}</h4>
              <p>{currentSong?.artist}</p>
            </div>
          </>
        ) : (
          <div className="song-details">
            <h4>No song selected</h4>
          </div>
        )}
        <div className="song-actions">
          <FaHeart />
          <FaEllipsisH />
        </div>
      </div>

      <div className="player-controls">
        <div className="control-buttons">
          <FaRandom />
          <FaStepBackward />
          <button
            className="play-pause"
            onClick={togglePlay}
            disabled={!currentSong || error || !isReady}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <FaStepForward />
          <FaRedo />
        </div>

        <div className="progress-container">
          <span className="progress-time">{formatTime((progress / 100) * duration)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={isNaN(progress) ? 0 : progress}
            onChange={handleSeek}
            className="progress-bar"
            disabled={!currentSong || error || !isReady}
          />
          <span className="progress-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-options">
        <div className="volume-control">
          <FaVolumeUp />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-bar"
          />
        </div>
        <FaExpand />
      </div>
    </footer>
  )
}